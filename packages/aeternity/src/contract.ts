import { JellyContract, Provider, ContractSwap, ContractWithdraw, ContractRefund } from './types';

import { Config } from '.';
import { getInputFromSwap, getInputFromWithdraw, getInputFromRefund } from './utils';

export default class AeternityContract implements JellyContract {
    public config: any;
    public provider: any;

    constructor(provider: Provider, config = Config()) {
        this.config = config;
        this.provider = provider;
    }

    async subscribe(onMessage: Function, filter: any) {}

    async getPastEvents(type: string, filter: any) {}

    async getCurrentBlock() {
        return await this.provider.getCurrentBlock();
    }

    async getBalance(address: string) {
        return await this.provider.getAeBalance(address);
    }

    async newContract(swap: ContractSwap, options = { waitMined: false }) {
        const result = await this.provider.callContract('new_swap', getInputFromSwap(swap), {
            ...swap.options,
            ...options,
        });
        return result;
    }

    async withdraw(withdraw: ContractWithdraw, options = { waitMined: false }) {
        const result = await this.provider.callContract('withdraw', getInputFromWithdraw(withdraw), options);
        return result;
    }

    async refund(refund: ContractRefund, options = { waitMined: false }) {
        const result = await this.provider.callContract('refund', getInputFromRefund(refund), options);
        return result;
    }
}
