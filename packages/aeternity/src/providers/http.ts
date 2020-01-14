import { Universal } from '@aeternity/aepp-sdk/es';

import { getInputFromSwap, getInputFromRefund, getInputFromWithdraw } from './utils';

import { ContractSwap, ContractWithdraw, ContractRefund, Provider } from '../types';

import Config from '../config';
import ContractSource from '../config/contractSource';

const CONFIG = Config();

export default class HttpProvider implements Provider {
    private config: any;
    private provider: any;
    private contract: any;
    private initialized: boolean;

    constructor(config = Config(), keypair?: any) {
        this.config = config;
        this.provider = Universal({
            url: config.providerUrl,
            internalUrl: config.internalUrl,
            compilerUrl: config.compilerUrl,
            keypair,
        });
    }

    async setup() {
        if (!this.initialized) {
            this.provider = await this.provider;
            this.contract = await this.provider.getContractInstance(ContractSource, {
                contractAddress: this.config.contractAddress,
            });
            this.initialized = true;
        }
    }

    async getCurrentBlock() {
        await this.setup();
        return await this.provider.height();
    }

    async getBalance(address: string) {
        await this.setup();
        return await this.provider.getBalance(address);
    }

    async newContract(swap: ContractSwap) {
        await this.setup();
        return await this.contract.call('new_contract', getInputFromSwap(swap), swap.options);
    }

    async withdraw(withdraw: ContractWithdraw) {
        await this.setup();
        return await this.contract.call('withdraw', getInputFromWithdraw(withdraw));
    }

    async refund(refund: ContractRefund) {
        await this.setup();
        return await this.contract.call('refund', getInputFromRefund(refund));
    }

    async getTxInfo(txHash: string) {
        await this.setup();
        return await this.provider.getTxInfo(txHash);
    }

    async getStatus(ids: any[]) {
        await this.setup();
        const result = await this.contract.methods['get_many_status'](ids);
        return result.decodedResult;
    }
}
