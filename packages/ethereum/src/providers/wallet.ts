import { ethers } from 'ethers';
import JsonRpcProvider from './jsonRpc';

export default class WalletProvider extends ethers.Wallet {
    constructor(privateKey: string) {
        super(privateKey, new JsonRpcProvider());
    }

    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string) {
        return await this.provider.getBalance(address);
    }
}
