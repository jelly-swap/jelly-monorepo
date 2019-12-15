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

export type Token = {
    network: string;
    decimals: number;
    address: string;
};

export type TokenConfigType = {
    [key: string]: Token;
};

export type AddressToTokenMap = {
    [key: string]: Token;
};
