import { ContractSwap } from '@jelly-swap/types';

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

export interface TronContractSwap extends ContractSwap {
    options: Options;
}

// TODO: Remove Options from common types and get rid of `amount` and `value`
declare type Options = {
    amount?: any;
    value?: any;
    feeLimit: number | string;
    callValue: number | string;
    shouldPollResponse: boolean;
};
