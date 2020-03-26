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

    async getStatus(ids: any[]) {
        const result = await this.provider.callContract('get_many_status', [ids]);
        return result?.decodedResult;
    }
}
