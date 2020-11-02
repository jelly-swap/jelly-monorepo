import { AlgorandProvider } from '@jelly-swap/types';
const algosdk = require('algosdk');
export default class MnemonicWallet {
    address: string;
    privateKey: string;
    provider: AlgorandProvider;

    constructor(mnemonic: string, provider: AlgorandProvider) {
        const keyPair = algosdk.mnemonicToSecretKey(mnemonic);
        this.address = keyPair.addr;
        this.privateKey = keyPair.sk;
        this.provider = provider;


    }
}