const algosdk = require('algosdk');
export default class MnemonicWallet {
    address: string;
    privateKey: string;

    constructor(mnemonic: string) {
        const keyPair = algosdk.mnemonicToSecretKey(mnemonic);
        this.address = keyPair.addr;
        this.privateKey = keyPair.sk

    }
}