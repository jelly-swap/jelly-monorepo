import { JellyContract, Provider, ContractSwap, ContractWithdraw, ContractRefund } from './types';

import EventHandler from './events';
import { Config } from '.';

export default class AeternityContract implements JellyContract {
    public config: any;
    public provider: any;

    private eventHandler: EventHandler;

    constructor(provider: Provider, config = Config()) {
        this.config = config;
        this.provider = provider;

        this.eventHandler = new EventHandler(this.provider, this.config);
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
        return await this.provider.getBalance(address);
    }

    async newContract(swap: ContractSwap) {
        const result = await this.provider.newContract(swap);
        return result;
    }

    async withdraw(withdraw: ContractWithdraw) {
        const result = await this.provider.withdraw(withdraw);
        return result;
    }

    async refund(refund: ContractRefund) {
        const result = await this.provider.refund(refund);
        return result;
    }

    async getStatus(ids: any[]) {
        return await this.provider.getStatus(ids);
    }
}
