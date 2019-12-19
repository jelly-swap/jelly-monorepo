import { ContractSwap, ContractRefund, ContractWithdraw, JellyContract, UserInputSwap } from '@jelly-swap/types';

export interface Erc20JellyContract extends Omit<JellyContract, 'getBalance' | 'newContract'> {
    getBalance(address: string, token: string): Promise<string | number>;
    newContract(swap: ContractSwap, checkAllowance: boolean): Promise<string>;
}

export interface Erc20ContractSwap extends ContractSwap {
    tokenAddress: string;
}

export interface Erc20ContractRefund extends ContractRefund {
    tokenAddress: string;
}

export interface Erc20ContractWithdraw extends ContractWithdraw {
    tokenAddress: string;
}

export interface Erc20UserInputSwap extends UserInputSwap {
    tokenAddress: string;
}

export { JellyAdapter } from '@jelly-swap/types';

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
