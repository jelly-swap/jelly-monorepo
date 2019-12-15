import { JellyAdapter, ContractSwap, UserInputSwap } from './types';

export default class Erc20Adapter implements JellyAdapter {
    createSwapFromInput(inputSwap: ContractSwap, sender?: string): ContractSwap {
        throw new Error('Method not implemented.');
    }
    addressValid(address: string): boolean {
        throw new Error('Method not implemented.');
    }
    parseAddress(address: string): string {
        throw new Error('Method not implemented.');
    }
    parseOutputAddress(address: string): string {
        throw new Error('Method not implemented.');
    }
    parseToNative(amount: string): string | number {
        throw new Error('Method not implemented.');
    }
    parseFromNative(amount: string): string | number {
        throw new Error('Method not implemented.');
    }
    formatInput(data: UserInputSwap, receiver: string): ContractSwap {
        throw new Error('Method not implemented.');
    }
    generateId(swap: ContractSwap): string {
        throw new Error('Method not implemented.');
    }
}
