import { JellyContract } from '@jelly-swap/types';

export default class TronContract implements JellyContract {
    subscribe(onMessage: Function, filter?: Function): void {
        throw new Error('Method not implemented.');
    }
    getPastEvents(type: string, filter: Function) {
        throw new Error('Method not implemented.');
    }
    getCurrentBlock(): Promise<string | number> {
        throw new Error('Method not implemented.');
    }
    getBalance(address: string): Promise<string | number> {
        throw new Error('Method not implemented.');
    }
    newContract(swap: import('@jelly-swap/types').ContractSwap): Promise<string> {
        throw new Error('Method not implemented.');
    }
    withdraw(withdraw: import('@jelly-swap/types').ContractWithdraw): Promise<string> {
        throw new Error('Method not implemented.');
    }
    refund(refund: import('@jelly-swap/types').ContractRefund): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getStatus(ids: any[]) {
        throw new Error('Method not implemented.');
    }
}
