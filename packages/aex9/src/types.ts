import { ContractSwap, ContractRefund, ContractWithdraw, JellyContract, UserInputSwap } from '@jelly-swap/types';

export interface Aex9JellyContract extends Omit<JellyContract, 'getBalance' | 'newContract'> {
    getBalance(address: string, token: string): Promise<string | number>;
    newContract(swap: ContractSwap, checkAllowance: boolean): Promise<string>;
}

export interface Aex9ContractSwap extends ContractSwap {
    tokenAddress: string;
}

export interface Aex9ContractRefund extends ContractRefund {
    tokenAddress: string;
}

export interface Aex9ContractWithdraw extends ContractWithdraw {
    tokenAddress: string;
}

export interface Aex9UserInputSwap extends UserInputSwap {
    tokenAddress: string;
}

export { JellyAdapter, Filter, SwapEvent, RefundEvent, WithdrawEvent } from '@jelly-swap/types';

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
