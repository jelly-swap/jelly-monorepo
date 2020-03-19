import { Node, Universal, MemoryAccount } from '../sdk-node';

import { getInputFromSwap, getInputFromRefund, getInputFromWithdraw } from './utils';

import { ContractSwap, ContractWithdraw, ContractRefund, Provider } from '../types';

import Config from '../config';
import ContractSource from '../config/contractSource';

export default class HttpProvider implements Provider {
    private config: any;
    private provider: any;
    private contract: any;
    private keypair: any;

    constructor(config = Config(), keypair?: any) {
        this.config = config;
        this.keypair = keypair;
    }

    async setup() {
        if (!this.provider) {
            const node = await Node({ url: this.config.providerUrl, internalUrl: this.config.internalUrl });

            this.provider = await Universal({
                nodes: [{ name: 'Jelly', instance: node }],
                compilerUrl: this.config.compilerUrl,
                accounts: this.keypair && [MemoryAccount({ keypair: this.keypair })],
            });

            this.contract = await this.provider.getContractInstance(ContractSource, {
                contractAddress: this.config.contractAddress,
            });
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
