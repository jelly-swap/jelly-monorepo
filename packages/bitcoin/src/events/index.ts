import NewContractEvent from './newContract';
import WithdrawEvent from './withdraw';
import ApiProvider from './api';

export default class Event {
    private newContract: NewContractEvent;
    private withdraw: WithdrawEvent;

    constructor(apiProviderUrl: string) {
        const provider = new ApiProvider(apiProviderUrl);

        this.newContract = new NewContractEvent(provider);
        this.withdraw = new WithdrawEvent(provider);
    }

    async getPast(type: string, filter?: any, currentBlock?: string | number) {
        switch (type) {
            case 'new': {
                return await this.newContract.getPast(filter);
            }

            case 'withdraw': {
                return await this.withdraw.getPast(filter);
            }

            case 'refund': {
                return [];
            }

            default: {
                break;
            }
        }
    }

    async subscribe(onMessage: Function, filter?: Function) {
        this.newContract.subscribe(onMessage('NEW_CONTRACT'), filter('new'));
        this.withdraw.subscribe(onMessage('WITHDRAW'), filter('withdraw'));
    }
}
