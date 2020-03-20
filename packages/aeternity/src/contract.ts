import { JellyContract, Provider, ContractSwap, ContractWithdraw, ContractRefund } from './types';

import EventHandler from './events';
import { Config } from '.';
import { getInputFromSwap, getInputFromWithdraw, getInputFromRefund } from './utils';

export default class AeternityContract implements JellyContract {
    public config: any;
    public provider: any;

    private eventHandler: EventHandler;

    constructor(provider: Provider, config = Config()) {
        this.config = config;
        this.provider = provider;
        this.eventHandler = new EventHandler(this, this.config);
    }

    async subscribe(onMessage: Function, filter: any) {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: any) {
        return await this.eventHandler.getPast(type, filter);
    }

    async getCurrentBlock() {
        return await this.provider.getCurrentBlock();
    }

    async getBalance(address: string) {
        return await this.provider.getAeBalance(address);
    }

    async newContract(swap: ContractSwap) {
        const result = await this.provider.callContract('new_contract', getInputFromSwap(swap), swap.options);
        return result;
    }

    async withdraw(withdraw: ContractWithdraw) {
        const result = await this.provider.callContract('withdraw', getInputFromWithdraw(withdraw));
        return result;
    }

    async refund(refund: ContractRefund) {
        const result = await this.provider.callContract('refund', getInputFromRefund(refund));
        return result;
    }

    async getStatus(ids: any[]) {
        const result = await this.provider.callContract('get_many_status', [ids]);
        return result;
    }
}
