import { Wallet } from 'ethers';
import { Filter } from 'ethers/providers';
import { FilterByBlock } from 'ethers/providers/abstract-provider';
import JsonRpcProvider from './jsonRpc';

export default class WalletProvider extends Wallet {
    constructor(privateKey: string, providerUrl: string) {
        super(privateKey, new JsonRpcProvider(providerUrl));
    }

    async getLogs(filter: Filter | FilterByBlock) {
        return await this.provider.getLogs(filter);
    }

    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string) {
        return await this.provider.getBalance(address);
    }
}
