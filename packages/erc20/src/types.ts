import { ContractSwap, ContractRefund, ContractWithdraw, JellyContract, UserInputSwap } from '@jelly-swap/types';

export interface Erc20JellyContract extends Omit<JellyContract, 'getBalance' | 'newContract' | 'withdraw' | 'refund'> {
    getBalance(address: string, token: string): Promise<string | number>;
    newContract(swap: ContractSwap, options?: Options): Promise<string>;
    withdraw(withdraw: Erc20ContractWithdraw, options?: Options): Promise<string>;
    refund(refund: Erc20ContractRefund, options?: Options): Promise<string>;
}

export type Options = {
    value?: any;
    gasLimit?: any;
    gasPrice?: any;
    nonce?: any;
};

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
