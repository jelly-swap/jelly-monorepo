import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw } from './types';

export default class Erc20Contract implements JellyContract {
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
    newContract(swap: ContractSwap): Promise<string> {
        throw new Error('Method not implemented.');
    }
    withdraw(withdraw: ContractWithdraw): Promise<string> {
        throw new Error('Method not implemented.');
    }
    refund(refund: ContractRefund): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getStatus(ids: any[]) {
        throw new Error('Method not implemented.');
    }
}
