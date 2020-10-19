export default class KeyPairWallet {
    address: string;
    privateKey: string;

    constructor(privateKey: string, address: string) {
        this.address = address;
        this.privateKey = privateKey;

    }
}