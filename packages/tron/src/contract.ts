import { JellyContract, ContractWithdraw, ContractRefund } from '@jelly-swap/types';
import { safeAccess } from '@jelly-swap/utils';

import EventHandler from './events';
import Config from './config';
import { TronContractSwap } from './types';

export default class TronContract implements JellyContract {
    private provider: any;
    private contract: any;
    private eventHandler: EventHandler;

    constructor(provider: any) {
        this.provider = provider;
        this.eventHandler = new EventHandler(this);
    }

    async setup() {
        if (!this.contract) {
            if (safeAccess(this.provider, ['tronWeb', 'contract'])) {
                this.contract = await this.provider.contract().at(Config().contractAddress);
            }
        }
    }

    async subscribe(onMessage: Function, filter?: Function) {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: Function) {
        return await this.eventHandler.getPast(type, filter);
    }

    async getCurrentBlock(): Promise<string | number> {
        if (safeAccess(this.provider, ['tronWeb', 'trx', 'getCurrentBlock'])) {
            const blockInfo = await this.provider.tronWeb.trx.getCurrentBlock();
            return safeAccess(blockInfo, ['block_header', 'raw_data', 'number']);
        }
    }

    async getBalance(address: string): Promise<string | number> {
        if (safeAccess(this.provider, ['tronWeb', 'trx', 'getBalance'])) {
            return await this.provider.tronWeb.trx.getBalance();
        }
    }

    async newContract(swap: TronContractSwap): Promise<string> {
        await this.setup();
        const result = await this.contract
            .newContract(
                swap.outputAmount,
                swap.expiration,
                swap.hashLock,
                swap.receiver,
                swap.outputNetwork,
                swap.outputAddress
            )
            .send(swap.options);
        return result;
    }

    async withdraw(withdraw: ContractWithdraw): Promise<string> {
        await this.setup();

        const result = await this.contract.withdraw(withdraw.id, withdraw.secret).send({
            feeLimit: 100000000,
            shouldPollResponse: false,
        });

        return result;
    }

    async refund(refund: ContractRefund): Promise<string> {
        await this.setup();

        const result = await this.contract.refund(refund.id).send({
            feeLimit: 100000000,
            shouldPollResponse: false,
        });

        return result;
    }

    async getStatus(ids: any[]) {
        await this.setup();
        return this.contract.getStatus(ids).call();
    }
}
