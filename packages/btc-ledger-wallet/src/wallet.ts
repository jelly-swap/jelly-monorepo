import {
    BitcoinWallet,
    BitcoinProvider,
    BitcoinNetwork,
    UnusedAddress,
    BitcoinAddress,
    UsedUnusedAddressesType,
} from '@jelly-swap/types';

import { Address, Networks } from '@jelly-swap/btc-utils';

import { bip32, ECPair, payments, address } from 'bitcoinjs-lib';
import coinselect from 'coinselect';

import { BigNumber } from 'bignumber.js';

import BtcLedger from '@ledgerhq/hw-app-btc';
import LedgerTransport from './transport';
import { serializeTransactionOutputs, getAmountBuffer } from './utils';

const ADDRESS_PREFIX = { legacy: 44, 'p2sh-segwit': 49, bech32: 84 } as any;

export default class BitcoinLedgerWallet implements BitcoinWallet {
    public provider: BitcoinProvider;
    public network: BitcoinNetwork;

    private derivationPath: string;
    private addressType: string;

    private ledgerKeyCache: any;
    private ledger: LedgerTransport;

    constructor(provider: any, network = Networks.bitcoin, addressType = 'bech32') {
        this.provider = provider;
        this.addressType = addressType;
        this.derivationPath = `${ADDRESS_PREFIX[addressType]}'/${network.coinType}'/0'`;
        this.network = network;

        this.ledgerKeyCache = {};
        this.ledger = new LedgerTransport(BtcLedger);
    }

    async getCurrentBlock(): Promise<number> {
        return await this.provider.getCurrentBlock();
    }

    async getAddress(index: number, change: boolean): Promise<string> {
        const result = await this.getAddresses(index, 1, change);
        return result[0].address;
    }

    async getAddresses(startingIndex = 0, numAddresses = 1, change = false): Promise<BitcoinAddress[]> {
        return this.getLedgerAddresses(startingIndex, numAddresses, change);
    }

    async getAddressList(numAddressPerCall = 25): Promise<BitcoinAddress[]> {
        let addressList: BitcoinAddress[] = [];

        const changeAddresses = await this.getChangeAddresses(0, numAddressPerCall);
        addressList = addressList.concat(changeAddresses);

        const nonChangeAddresses = await this.getNonChangeAddresses(0, numAddressPerCall);
        addressList = addressList.concat(nonChangeAddresses);

        return addressList;
    }

    async getWalletAddress(address: string, maxAddresses = 1000, addressesPerCall = 50): Promise<BitcoinAddress> {
        let index = 0;
        let change = false;

        while (index < maxAddresses) {
            const addresses = await this.getAddresses(index, addressesPerCall, change);
            const addr = addresses.find((addr: Address) => addr.equals(address));

            if (addr) {
                return addr;
            }

            index += addressesPerCall;

            if (index === maxAddresses && !change) {
                index = 0;
                change = true;
            }
        }

        throw new Error('ADDRESS_MISSING_IN_LEDGER');
    }

    async getBalance(numAddressPerCall = 25): Promise<number> {
        let addressList = await this.getAddressList(numAddressPerCall);
        return await this.provider.getBalance(addressList);
    }

    async getChangeAddresses(startingIndex = 0, numAddresses = 1): Promise<BitcoinAddress[]> {
        return await this.getAddresses(startingIndex, numAddresses, true);
    }

    async getNonChangeAddresses(startingIndex = 0, numAddresses = 1): Promise<BitcoinAddress[]> {
        return await this.getAddresses(startingIndex, numAddresses, false);
    }

    async getUsedAddresses(numAddressPerCall = 25): Promise<BitcoinAddress[]> {
        return await this.getUsedUnusedAddresses(numAddressPerCall).then(({ usedAddresses }) => usedAddresses);
    }

    async getUnusedAddress(change = false, numAddressPerCall = 25): Promise<BitcoinAddress> {
        const key = change ? 'change' : 'nonChange';
        return await this.getUsedUnusedAddresses(numAddressPerCall).then(({ unusedAddress }) => unusedAddress[key]);
    }

    async getUsedUnusedAddresses(numAddressPerCall = 25): Promise<UsedUnusedAddressesType> {
        const usedAddresses: BitcoinAddress[] = [];
        const unusedAddress: UnusedAddress = { change: null, nonChange: null };

        let addressList = await this.getAddressList(numAddressPerCall);

        const utxos = await this.provider.getUnspentTransactions(addressList);

        for (const address of addressList) {
            const key = address.change ? 'change' : 'nonChange';

            const isUsed = utxos.find((utxo: any) => address.equals(utxo.address));

            if (isUsed) {
                usedAddresses.push(address);
                unusedAddress[key] = null;
            } else {
                if (!unusedAddress[key]) {
                    unusedAddress[key] = address;
                }
            }
        }

        if (!unusedAddress['change']) {
            unusedAddress['change'] = addressList[0];
        }

        if (!unusedAddress['nonChange']) {
            unusedAddress['nonChange'] = addressList[0];
        }

        return { usedAddresses, unusedAddress };
    }

    async getUnusedChangeAddress(numAddressPerCall = 25): Promise<BitcoinAddress> {
        return await this.getUnusedAddress(true, numAddressPerCall);
    }

    async getUnusedNonChangeAddress(numAddressPerCall = 25): Promise<BitcoinAddress> {
        return await this.getUnusedAddress(false, numAddressPerCall);
    }

    async signMessage(message: string, from: string): Promise<string> {
        return 'Not implemented';
    }

    async buildTransaction(to: string, value: number, data: any, feePerByte?: number): Promise<string> {
        return this._buildTransaction([{ to, value }], data, feePerByte);
    }

    async sendTransaction(to: string, value: number, data: any, feePerByte?: number): Promise<string> {
        return this._sendTransaction([{ to, value }], data, feePerByte);
    }

    async signP2SHTransaction(
        tx: any,
        rawTx: any,
        address: any,
        vout: any,
        outputScript: any,
        segwit = false,
        expiration = 0
    ): Promise<Buffer> {
        const app = await this.ledger.getInstance();
        const walletAddress = await this.getWalletAddress(address);

        if (!segwit) {
            tx.setInputScript(vout.mintIndex, outputScript);
        }

        const ledgerInputTx = await app.splitTransaction(rawTx, true);
        const ledgerTx = await app.splitTransaction(tx.toHex(), true);
        const ledgerOutputs = serializeTransactionOutputs(ledgerTx.outputs).toString('hex');

        const ledgerSig = await app.signP2SHTransaction(
            [[ledgerInputTx, vout.mintIndex, outputScript.toString('hex'), 0]],
            [walletAddress.derivationPath],
            ledgerOutputs,
            expiration,
            undefined, // SIGHASH_ALL
            segwit,
            2
        );

        const finalSig = segwit ? ledgerSig[0] : ledgerSig[0] + '01';
        const sig = Buffer.from(finalSig, 'hex');
        return sig;
    }

    private async getInputsForAmount(amount: number | string, feePerByte?: number | string, numAddressPerCall = 25) {
        let addrList = await this.getAddressList(numAddressPerCall);

        const utxos = await this.provider.getUnspentTransactions(addrList);

        const updatedUtxos = utxos.map((utxo: any) => {
            const addr = addrList.find((a) => a.equals(utxo.address));
            return {
                ...utxo,
                value: new BigNumber(utxo.amount).times(1e8).toNumber(),
                derivationPath: addr.derivationPath,
            };
        });

        if (!feePerByte) {
            feePerByte = await this.provider.getFeePerByte();
        }

        const result = this.getInputs(updatedUtxos, Number(amount), feePerByte);

        if (result.inputs) {
            return result;
        } else {
            // if user tries to use the whole available balance
            const fixedAmount = new BigNumber(amount).minus(result.fee).toNumber();
            const fixedResult = this.getInputs(updatedUtxos, Number(fixedAmount), feePerByte);
            if (fixedResult.inputs) {
                return fixedResult;
            }
        }

        throw new Error('NOT_ENOUGHT_BALANCE');
    }

    private getInputs(utxos: any, amount: number, feePerByte: any) {
        const { inputs, outputs, fee } = coinselect(utxos, [{ id: 'main', value: amount }], feePerByte);

        if (inputs && outputs) {
            let change = outputs.find((output: any) => output.id !== 'main');

            if (change) {
                if (change.length) {
                    change = change[0].value;
                }
            }

            return { inputs, change, fee, amount };
        }

        return { fee, amount };
    }

    private getAddressFromPublicKey(publicKey: Buffer): string {
        if (this.addressType === 'legacy') {
            return payments.p2pkh({
                pubkey: publicKey,
                network: this.network,
            }).address;
        } else if (this.addressType === 'p2sh-segwit') {
            return payments.p2sh({
                redeem: payments.p2wpkh({
                    pubkey: publicKey,
                    network: this.network,
                }),
                network: this.network,
            }).address;
        } else if (this.addressType === 'bech32') {
            return payments.p2wpkh({
                pubkey: publicKey,
                network: this.network,
            }).address;
        }
    }

    private async getLedgerInputs(utxos: any[]) {
        const ledger = await this.ledger.getInstance();

        return Promise.all(
            utxos.map(async (u) => {
                const hex = await this.provider.getRawTransaction(u.mintTxid);
                const tx = ledger.splitTransaction(hex, true);
                return [tx, u.mintIndex];
            })
        );
    }

    private async _getWalletPublicKey(path: string) {
        const ledger = await this.ledger.getInstance();
        const format = this.addressType === 'p2sh-segwit' ? 'p2sh' : this.addressType;
        return await ledger.getWalletPublicKey(path, { format });
    }

    async getWalletPublicKey(path: string) {
        if (path in this.ledgerKeyCache) {
            return this.ledgerKeyCache[path];
        }

        const key = await this._getWalletPublicKey(path);
        this.ledgerKeyCache[path] = key;
        return key;
    }

    private async getLedgerAddresses(
        startingIndex: number,
        numAddresses: number,
        change = false
    ): Promise<BitcoinAddress[]> {
        const result = await this.getWalletPublicKey(this.derivationPath);
        const pubKeyBuffer = Buffer.from(result.publicKey, 'hex');
        const chainCode = result.chainCode;
        const compressed = ECPair.fromPublicKey(pubKeyBuffer).publicKey.toString('hex');
        const node = bip32.fromPublicKey(Buffer.from(compressed, 'hex'), Buffer.from(chainCode, 'hex'), this.network);

        const addresses = [];
        const lastIndex = startingIndex + numAddresses;
        const changeVal = change ? '1' : '0';

        for (let currentIndex = startingIndex; currentIndex < lastIndex; currentIndex++) {
            const subPath = changeVal + '/' + currentIndex;
            const publicKey = node.derivePath(subPath).publicKey;
            const address = this.getAddressFromPublicKey(publicKey);
            const path = `${this.derivationPath}/${subPath}`;

            addresses.push(new Address(address, path, publicKey, currentIndex, change));
        }

        return addresses;
    }

    private async _buildTransaction(outputs: any, data: any, feePerByte?: number): Promise<string> {
        const ledger = await this.ledger.getInstance();

        const totalValue = outputs
            .reduce((prev: BigNumber, curr: any) => {
                return prev.plus(new BigNumber(curr.value));
            }, new BigNumber(0))
            .toNumber();

        const unusedAddress = await this.getUnusedAddress(true);
        const { inputs, change, amount } = await this.getInputsForAmount(totalValue, feePerByte);
        let amountWithoutFee = amount;

        const ledgerInputs = await this.getLedgerInputs(inputs);
        const paths = inputs.map((utxo: any) => utxo.derivationPath);

        let ledgerOutputs = [];
        // Add metadata
        if (data) {
            const metadata = Buffer.from(`J_${data.eventName}`, 'utf8');
            const embed = payments.embed({ data: [metadata] });

            ledgerOutputs.push({
                amount: getAmountBuffer(0),
                script: embed.output,
            });

            // replace the inputAmount of the metadata with amount - fee in case the whole balance is used.
            if (amountWithoutFee) {
                const ratio = new BigNumber(data.outputAmount).dividedBy(new BigNumber(data.inputAmount));
                data.inputAmount = amountWithoutFee;
                data.outputAmount = ratio.multipliedBy(new BigNumber(amountWithoutFee)).toFixed(0).toString();
            }
        }

        ledgerOutputs = ledgerOutputs.concat(
            outputs.map((output: any) => {
                let amount;

                if (amountWithoutFee) {
                    amount = amountWithoutFee;
                    amountWithoutFee = null;
                } else {
                    amount = output.value;
                }

                return {
                    amount: getAmountBuffer(amount),
                    script: address.toOutputScript(output.to, this.network),
                };
            })
        );

        if (change) {
            ledgerOutputs.push({
                amount: getAmountBuffer(change.value),
                script: address.toOutputScript(unusedAddress.address, this.network),
            });
        }

        const serializedOutputs = serializeTransactionOutputs(ledgerOutputs).toString('hex');

        return ledger.createPaymentTransactionNew(
            ledgerInputs,
            paths,
            unusedAddress.derivationPath,
            serializedOutputs,
            undefined,
            undefined,
            ['bech32', 'p2sh-segwit'].includes(this.addressType),
            undefined,
            this.addressType === 'bech32' ? ['bech32'] : undefined
        );
    }

    private async _sendTransaction(outputs: any, data: any, feePerByte?: number) {
        const signedTransaction = await this._buildTransaction(outputs, data, feePerByte);
        return await this.provider.sendRawTransaction(signedTransaction, data);
    }
}
