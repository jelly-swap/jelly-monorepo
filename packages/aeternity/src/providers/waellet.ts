import { ContractSwap, ContractRefund, ContractWithdraw, Provider } from '../types';

import HttpProvider from './http';
import { getInputFromSwap, getInputFromRefund, getInputFromWithdraw } from './utils';

import Config from '../config';
import ContractSource from '../config/contractSource';

export default class WaelletProvider implements Provider {
    private config: any;
    private provider: any;
    private api: HttpProvider;

    constructor(config = Config(), provider: any) {
        this.config = config;
        this.provider = provider;
        this.api = new HttpProvider(config);
    }

    async getBalance(address: string) {
        return this.api.getBalance(address);
    }

    async getCurrentBlock() {
        return await this.api.getCurrentBlock();
    }

    async newContract(swap: ContractSwap) {
        const result = await this.provider.request
            .contractCall({
                source: ContractSource,
                address: this.config.contractAddress,
                method: 'new_contract',
                params: getInputFromSwap(swap),
                options: swap.options,
            })
            .then((result: any) => result)
            .catch((err: any) => {
                throw new Error(err);
            });

        return result.hash;
    }

    async withdraw(withdraw: ContractWithdraw) {
        const result = await this.provider.request
            .contractCall({
                source: ContractSource,
                address: this.config.contractAddress,
                method: 'withdraw',
                params: getInputFromWithdraw(withdraw),
            })
            .then((result: any) => result)
            .catch((err: any) => {
                throw new Error(err);
            });

        return result.hash;
    }

    async refund(refund: ContractRefund) {
        const result = await this.provider.request
            .contractCall({
                source: ContractSource,
                address: this.config.contractAddress,
                method: 'refund',
                params: getInputFromRefund(refund),
            })
            .then((result: any) => result)
            .catch((err: any) => {
                throw new Error(err);
            });

        return result.hash;
    }

    async getStatus(ids: any[]) {
        const result = await this.provider.request
            .contractCallStatic({
                source: ContractSource,
                address: this.config.contractAddress,
                method: 'get_many_status',
                params: [ids],
            })
            .then((result: any) => result)
            .catch((err: any) => {
                throw new Error(err);
            });
        return result.decodedResult;
    }

    async getTxInfo(txHash: string) {
        return await this.api.getTxInfo(txHash);
    }
}
