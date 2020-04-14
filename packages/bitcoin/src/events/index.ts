import { Filter } from '@jelly-swap/types';

import NewContractEvent from './newContract';
import WithdrawEvent from './withdraw';
import ApiProvider from './api';

export default class Event {
    private newContract: NewContractEvent;
    private withdraw: WithdrawEvent;
    private provider: ApiProvider;

    private interval: any;

    constructor(apiProviderUrl: string) {
        this.provider = new ApiProvider(apiProviderUrl);

        this.newContract = new NewContractEvent(this.provider);
        this.withdraw = new WithdrawEvent(this.provider);
    }

    async getPast(type: string, filter: Filter) {
        switch (type) {
            case 'new': {
                return await this.newContract.getPast(filter.new);
            }

            case 'withdraw': {
                return await this.withdraw.getPast(filter.withdraw);
            }

            case 'refund': {
                return [];
            }

            default: {
                break;
            }
        }
    }

    async subscribe(onMessage: Function, filter: Filter) {
        const initialLastBlock = Number(await this.provider.lastBlock());

        this.newContract.lastBlock = initialLastBlock;
        this.withdraw.lastBlock = initialLastBlock;

        this.interval = setInterval(async () => {
            const lastBlock = Number(await this.provider.lastBlock());

            await this.newContract.subscribe(onMessage, filter.new, lastBlock);
            await this.withdraw.subscribe(onMessage, filter.withdraw, lastBlock);
        }, 2 * 1000);
    }

    async unsubscribe() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    async getStatus(ids: string[]) {
        return await this.provider.getStatus(ids);
    }
}
