import { ContractSwap, ContractWithdraw, ContractRefund } from '@jelly-swap/types';

export {
    ContractSwap,
    ContractWithdraw,
    ContractRefund,
    SwapEvent,
    WithdrawEvent,
    RefundEvent,
    JellyContract,
    UserInputSwap,
    JellyAdapter,
    Filter,
} from '@jelly-swap/types';

export interface Provider {
    getBalance(address: string): Promise<string | number>;

    newContract(swap: ContractSwap): Promise<string>;

    withdraw(withdraw: ContractWithdraw): Promise<string>;

    refund(refund: ContractRefund): Promise<string>;

    getTxInfo(txHash: string): Promise<TxInfo>;

    getStatus(ids: any[]): any;
}

type TxInfo = {
    log: [];
};
