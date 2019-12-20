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

import { ContractWithdraw, ContractRefund, SwapEvent } from '@jelly-swap/types';

export interface BtcContractRefund extends ContractRefund {
    hashLock: string;
    sender: string;
    receiver: string;
    transactionHash: string;
    refundAddress: string;
    expiration: string;
}

export interface BtcContractWithdraw extends ContractWithdraw {
    hashLock: string;
    sender: string;
    receiver: string;
    transactionHash: string;
    refundAddress: string;
    expiration: string;
}

export interface BtcSwapEvent extends SwapEvent {
    refundAddress: string;
}
