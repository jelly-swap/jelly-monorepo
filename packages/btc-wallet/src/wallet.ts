import BigNumber from 'bignumber.js';
import { ECPair, payments, script, bip32, TransactionBuilder, Transaction } from 'bitcoinjs-lib';
import { mnemonicToSeed } from 'bip39';
import coinselect from 'coinselect';

import { Network } from './types';
import * as Config from './config';
import Address from './Address';
import Networks from './networks';

export default class BtcWallet {
    public network: Network;
    public provider: any;

    private derivationPath: string;
    private mnemonic: string;
    private addressType: string;

    constructor(network = Networks.testnet, mnemonic: string, addressType = 'bech32', provider: any) {
        if (!Config.AddressTypes.includes(addressType)) {
            throw new Error(`Address type must be one of ${Config.AddressTypes.join(',')}`);
        }

        if (!mnemonic) {
            throw new Error('INVALID_MNEMONIC');
        }

        this.derivationPath = `${Config.AddressTypeToPrefix[addressType]}'/${network.coinType}'/0'/`;
        this.network = network;
        this.mnemonic = mnemonic;
        this.addressType = addressType;
        this.provider = provider;
    }

    async node() {
        const seed = await mnemonicToSeed(this.mnemonic);
        return bip32.fromSeed(seed, this.network);
    }

    async keyPair(derivationPath: string): Promise<any> {
        const node = await this.node();
        const wif = node.derivePath(derivationPath).toWIF();
        return ECPair.fromWIF(wif, this.network);
    }

    async getAddress(index: number, change: boolean) {
        const node = await this.node();
        const address = this._getAddress(node, index, change);
        return address.address;
    }

    async getAddresses(startingIndex = 0, numAddresses = 1, change = false) {
        const node = await this.node();

        const addresses = [];
        const lastIndex = startingIndex + numAddresses;

        for (let currentIndex = startingIndex; currentIndex < lastIndex; currentIndex++) {
            const address = this._getAddress(node, currentIndex, change);
            addresses.push(address);
        }

        return addresses;
    }

    async getAddressList(numAddressPerCall = 25) {
        let addressList: any[] = [];

        const changeAddresses = await this.getChangeAddresses(0, numAddressPerCall);
        addressList = addressList.concat(changeAddresses);

        const nonChangeAddresses = await this.getNonChangeAddresses(0, numAddressPerCall);
        addressList = addressList.concat(nonChangeAddresses);

        return addressList;
    }

    async getWalletAddress(address: string, maxAddresses = 1000, addressesPerCall = 50) {
        let index = 0;
        let change = false;

        // If maxAddresses is reached we assume the wallet doesn't contain the address
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

        throw new Error('ADDRESS_MISSING_IN_WALLET');
    }

    async getBalance(numAddressPerCall = 25) {
        let addressList = await this.getAddressList(numAddressPerCall);

        const utxos = await this.provider.getUnspentTransactions(addressList);

        const balance = utxos
            .reduce((prev: BigNumber, curr: any) => {
                return prev.plus(new BigNumber(curr.value));
            }, new BigNumber(0))
            .toNumber();

        return balance;
    }

    async getChangeAddresses(startingIndex = 0, numAddresses = 1) {
        return await this.getAddresses(startingIndex, numAddresses, true);
    }

    async getNonChangeAddresses(startingIndex = 0, numAddresses = 1) {
        return await this.getAddresses(startingIndex, numAddresses, false);
    }

    async getUsedAddresses(numAddressPerCall = 25) {
        return await this.getUsedUnusedAddresses(numAddressPerCall).then(({ usedAddresses }) => usedAddresses);
    }

    async getUnusedAddress(change = false, numAddressPerCall = 25) {
        const key = change ? 'change' : 'nonChange';
        return await this.getUsedUnusedAddresses(numAddressPerCall).then(({ unusedAddress }) => unusedAddress[key]);
    }

    async getUsedUnusedAddresses(numAddressPerCall = 25) {
        const usedAddresses = [];
        const unusedAddress: any = { change: null, nonChange: null };

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

    async getUnusedChangeAddress(numAddressPerCall = 25) {
        return await this.getUnusedAddress(true, numAddressPerCall);
    }

    async getUnusedNonChangeAddress(numAddressPerCall = 25) {
        return await this.getUnusedAddress(false, numAddressPerCall);
    }

    async buildTransaction(to: string, value: number | string, data: any, feePerByte: number | string) {
        return await this._buildTransaction([{ to, value }], data, feePerByte);
    }

    async sendTransaction(to: string, value: number | string, data: any, feePerByte?: number | string) {
        return await this._sendTransaction([{ to, value }], data, feePerByte);
    }

    async signP2SHTransaction(tx: any, address: string, vout: any, outputScript: any, segwit = false) {
        const wallet = await this.getWalletAddress(address);
        const keyPair = await this.keyPair(wallet.derivationPath);

        let sigHash;
        if (segwit) {
            sigHash = tx.hashForWitnessV0(0, outputScript, vout.value, Transaction.SIGHASH_ALL);
        } else {
            sigHash = tx.hashForSignature(0, outputScript, Transaction.SIGHASH_ALL);
        }

        const sig = script.signature.encode(keyPair.sign(sigHash), Transaction.SIGHASH_ALL);

        return sig;
    }

    getScriptType() {
        if (this.addressType === 'legacy') {
            return 'p2pkh';
        } else if (this.addressType === 'p2sh-segwit') {
            return 'p2sh-p2wpkh';
        } else if (this.addressType === 'bech32') {
            return 'p2wpkh';
        }
    }

    getAddressFromPublicKey(publicKey: any) {
        return this.getPaymentVariantFromPublicKey(publicKey).address;
    }

    getPaymentVariantFromPublicKey(publicKey: any) {
        if (this.addressType === 'legacy') {
            return payments.p2pkh({
                pubkey: publicKey,
                network: this.network,
            });
        } else if (this.addressType === 'p2sh-segwit') {
            return payments.p2sh({
                redeem: payments.p2wpkh({
                    pubkey: publicKey,
                    network: this.network,
                }),
                network: this.network,
            });
        } else if (this.addressType === 'bech32') {
            return payments.p2wpkh({
                pubkey: publicKey,
                network: this.network,
            });
        }
    }

    async getInputsForAmount(amount: number | string, feePerByte?: number | string, numAddressPerCall = 25) {
        let addrList = await this.getAddressList(numAddressPerCall);

        const utxos = await this.provider.getUnspentTransactions(addrList);

        const updatedUtxos = utxos.map((utxo: any) => {
            const addr = addrList.find(a => a.equals(utxo.address));
            return {
                ...utxo,
                value: new BigNumber(utxo.amount).times(1e8).toNumber(),
                derivationPath: addr.derivationPath,
            };
        });

        if (!feePerByte) {
            feePerByte = await this.provider.getFeePerByte();
        }

        const { inputs, outputs, fee } = coinselect(updatedUtxos, [{ id: 'main', value: amount }], feePerByte);

        if (inputs && outputs) {
            let change = outputs.find((output: any) => output.id !== 'main');

            if (change) {
                if (change.length) {
                    change = change[0].value;
                }
            }

            return { inputs, change, fee };
        }

        throw new Error('NOT_ENOUGHT_BALANCE');
    }

    _getAddress(node: bip32.BIP32Interface, index: number, change: boolean) {
        const changeVal = change ? '1' : '0';

        const subPath = changeVal + '/' + index;

        const path = this.derivationPath + subPath;

        const publicKey = node.derivePath(path).publicKey;

        const address = this.getAddressFromPublicKey(publicKey);

        return new Address(address, path, publicKey, index, change);
    }

    async _buildTransaction(outputs: any, data: any, feePerByte?: any) {
        const network = this.network;

        const totalValue = outputs
            .reduce((prev: BigNumber, curr: any) => {
                return prev.plus(new BigNumber(curr.value));
            }, new BigNumber(0))
            .toNumber();

        const { inputs, change } = await this.getInputsForAmount(totalValue, feePerByte);

        if (change) {
            const unusedAddress = await this.getUnusedChangeAddress();
            outputs.push({ to: unusedAddress, value: change.value });
        }

        const txBuilder = new TransactionBuilder(network);

        // Add metadata
        if (data) {
            const metadata = Buffer.from(JSON.stringify(data), 'utf8');
            const embed = payments.embed({ data: [metadata] });
            txBuilder.addOutput(embed.output, 0);
        }

        for (const output of outputs) {
            const to = output.to.address || output.to;
            txBuilder.addOutput(to, output.value);
        }

        const prevOutScriptType = this.getScriptType();

        for (const input of inputs) {
            const wallet = await this.getWalletAddress(input.address);
            const keyPair = await this.keyPair(wallet.derivationPath);

            const paymentVariant = this.getPaymentVariantFromPublicKey(keyPair.publicKey);

            txBuilder.addInput(input.mintTxid, input.mintIndex, 0, paymentVariant.output);
        }

        for (let index = 0; index < inputs.length; index++) {
            const wallet = await this.getWalletAddress(inputs[index].address);
            const keyPair = await this.keyPair(wallet.derivationPath);
            const paymentVariant = this.getPaymentVariantFromPublicKey(keyPair.publicKey);

            const needsWitness = this.addressType === 'bech32' || this.addressType === 'p2sh-segwit';

            const signParams: any = { prevOutScriptType, vin: index, keyPair };

            if (needsWitness) {
                signParams.witnessValue = inputs[index].value;
            }

            if (this.addressType === 'p2sh-segwit') {
                signParams.redeemScript = paymentVariant.redeem.output;
            }

            txBuilder.sign(signParams);
        }

        const raw = txBuilder.build().toHex();

        return raw;
    }

    async _sendTransaction(outputs: any, data: any, feePerByte?: number | string) {
        const signedTransaction = await this._buildTransaction(outputs, data, feePerByte);
        return await this.provider.sendRawTransaction(signedTransaction);
    }
}
