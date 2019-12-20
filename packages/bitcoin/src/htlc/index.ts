import { TransactionBuilder, payments as BitcoinPayments, script as BitcoinScript } from 'bitcoinjs-lib';
import { fixHash, sha256 } from '@jelly-swap/utils';

import BtcWallet from '@jelly-swap/btc-wallet';
import BtcProvider from '@jelly-swap/btc-provider';

import { getSwapInput, getSwapOutput, getSwapPaymentVariants, calculateFee } from './utils';
import { BtcSwapEvent, RefundEvent } from '../types';

export default class HTLC {
    private network: any;
    private wallet: BtcWallet;
    private provider: BtcProvider;
    private mode: string;

    constructor(wallet: BtcWallet, provider: BtcProvider, mode = 'p2wsh') {
        this.network = wallet.network;
        this.wallet = wallet;
        this.provider = provider;
        this.mode = mode;
    }

    async newSwap(
        value: string | number,
        recipientAddress: string,
        refundAddress: string,
        hashLock: string,
        expiration: number,
        metadata: BtcSwapEvent
    ) {
        const swapOutput = getSwapOutput(recipientAddress, refundAddress, fixHash(hashLock, false), expiration);
        const address = getSwapPaymentVariants(swapOutput, this.network)[this.mode].address;
        return await this.wallet.sendTransaction(address, value, metadata);
    }

    async withdraw(
        initiationTxHash: string,
        recipientAddress: string,
        refundAddress: string,
        expiration: number,
        secret: string,
        metadata: any,
        secretHash?: string
    ) {
        if (!secretHash) {
            secretHash = sha256(Buffer.from(fixHash(secret, false), 'hex')).toString('hex');
        }

        return this.redeem(
            true,
            initiationTxHash,
            recipientAddress,
            refundAddress,
            expiration,
            fixHash(secretHash, false),
            metadata,
            fixHash(secret, false)
        );
    }

    async refund(
        initiationTxHash: string,
        recipientAddress: string,
        refundAddress: string,
        expiration: number,
        secretHash: string,
        metadata: RefundEvent
    ) {
        return this.redeem(
            false,
            initiationTxHash,
            recipientAddress,
            refundAddress,
            expiration,
            fixHash(secretHash, false),
            metadata
        );
    }

    async redeem(
        isWithdraw: boolean,
        initiationTxHash: string,
        recipientAddress: string,
        refundAddress: string,
        expiration: number,
        secretHash: string,
        metadata: any,
        secret?: string
    ) {
        const network = this.network;

        const address = isWithdraw ? recipientAddress : refundAddress;

        const swapOutput = getSwapOutput(recipientAddress, refundAddress, secretHash, expiration);

        const swapPaymentVariants = getSwapPaymentVariants(swapOutput, network);

        const initiationTx = await this.provider.getTransaction(initiationTxHash);

        let swapVout;
        let paymentVariantName;
        let paymentVariant: any;

        for (const outputTx of initiationTx.outputs) {
            const paymentVariantEntry = Object.entries(swapPaymentVariants).find(
                ([, payment]: any) => payment.output.toString('hex') === outputTx.script
            );

            if (paymentVariantEntry) {
                paymentVariantName = paymentVariantEntry[0];
                paymentVariant = paymentVariantEntry[1];
                swapVout = outputTx;
            }
        }

        if (swapVout) {
            const feePerByte = await this.provider.getFeePerByte();
            const txFee = calculateFee(1, 1, feePerByte); // TODO: fix this magic :X

            swapVout.txid = initiationTxHash;

            if (swapVout.value - txFee < 0) {
                throw new Error('TX_AMOUNT_DO_NOT_COVER_FEE');
            }

            const txBuilder = new TransactionBuilder(network);

            // Add metadata
            if (metadata) {
                const embed = BitcoinPayments.embed({ data: [Buffer.from(JSON.stringify(metadata), 'utf8')] });
                txBuilder.addOutput(embed.output, 0);
            }

            if (!isWithdraw) {
                txBuilder.setLockTime(expiration);
            }

            const prevOutScript = paymentVariant.output;

            txBuilder.addInput(swapVout.txid, swapVout.mintIndex, 0, prevOutScript);
            txBuilder.addOutput(address, swapVout.value - txFee);

            const tx = txBuilder.buildIncomplete();

            const isSegwit = paymentVariantName === 'p2wsh' || paymentVariantName === 'p2shSegwit';

            const sig = await this.wallet.signP2SHTransaction(
                tx,
                address,
                swapVout,
                isSegwit ? swapPaymentVariants.p2wsh.redeem.output : swapPaymentVariants.p2sh.redeem.output,
                isSegwit
            );

            const walletAddress = await this.wallet.getWalletAddress(address);

            const swapInput = getSwapInput(sig, walletAddress.publicKey, isWithdraw, secret);

            const paymentParams = {
                redeem: { output: swapOutput, input: swapInput, network },
                network,
            };

            const paymentWithInput = isSegwit
                ? BitcoinPayments.p2wsh(paymentParams)
                : BitcoinPayments.p2sh(paymentParams);

            if (isSegwit) {
                tx.setWitness(0, paymentWithInput.witness);
            }

            if (paymentVariantName === 'p2shSegwit') {
                // Adds the necessary push OP (PUSH34 (00 + witness script hash))
                const inputScript = BitcoinScript.compile([swapPaymentVariants.p2shSegwit.redeem.output]);
                tx.setInputScript(0, inputScript);
            } else if (paymentVariantName === 'p2sh') {
                tx.setInputScript(0, paymentWithInput.input);
            }

            return this.provider.sendRawTransaction(tx.toHex());
        } else {
            throw new Error(`INVALID_REDEEM_${isWithdraw}`);
        }
    }
}
