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
} from '@jelly-swap/types';

import {
    ContractWithdraw,
    ContractRefund,
    SwapEvent,
    JellyAdapter,
    UserInputSwap,
    ContractSwap,
} from '@jelly-swap/types';

export interface AlgoContractRefund extends ContractRefund {
    hashLock: string;
    sender: string;
    receiver: string;
    transactionHash: string;
    refundAddress: string;
    expiration: string;
}

export interface AlgoContractWithdraw extends ContractWithdraw {
    hashLock: string;
    sender: string;
    receiver: string;
    transactionHash: string;
    refundAddress: string;
    expiration: string;
}

export interface AlgoSwapEvent extends SwapEvent {
    refundAddress: string;
}

export interface AlgoAdapterInterface extends Omit<JellyAdapter, 'formatInput' | 'createSwapFromInput'> {
    formatInput(data: UserInputSwap, receiver: string): Promise<ContractSwap>;
    createSwapFromInput(inputSwap: ContractSwap, sender?: string): Promise<ContractSwap>;
}
