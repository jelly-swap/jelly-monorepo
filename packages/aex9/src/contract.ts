import { Aex9JellyContract, Aex9ContractSwap, Aex9ContractWithdraw, Aex9ContractRefund } from './types';

import Aex9Source from './config/aex9';

import EventHandler from './events';
import { Config } from '.';
import { getInputFromSwap, getInputFromWithdraw, getInputFromRefund } from './utils';

export default class AeternityContract implements Aex9JellyContract {
    public config: any;
    public provider: any;

    private eventHandler: EventHandler;

    constructor(provider: any, config = Config()) {
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

    async getTokenContract(tokenAddress: string) {
        await this.provider.setup();
        return await this.provider.client.getContractInstance(Aex9Source, {
            contractAddress: tokenAddress,
        });
    }

    async newContract(swap: Aex9ContractSwap) {
        const result = await this.provider.callContract('new_contract', getInputFromSwap(swap));
        return result;
    }

    async withdraw(withdraw: Aex9ContractWithdraw) {
        const result = await this.provider.callContract('withdraw', getInputFromWithdraw(withdraw));
        return result;
    }

    async refund(refund: Aex9ContractRefund) {
        const result = await this.provider.callContract('refund', getInputFromRefund(refund));
        return result;
    }

    async getStatus(ids: any[]) {
        const result = await this.provider.callContract('get_many_status', [ids]);
        return result?.decodedResult;
    }
}
