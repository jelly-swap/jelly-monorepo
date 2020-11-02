import { AlgorandProvider } from '@jelly-swap/types';

export default class KeyPairWallet {
    address: string;
    privateKey: string;
    provider: AlgorandProvider;

    constructor(privateKey: string, address: string, provider: AlgorandProvider) {
        this.address = address;
        this.privateKey = privateKey;
        this.provider = provider;

    }
}