import { JellyAdapter } from '@jelly-swap/types';

export default class TronAdapter implements JellyAdapter {
    createSwapFromInput(
        inputSwap: import('@jelly-swap/types').ContractSwap,
        sender?: string
    ): import('@jelly-swap/types').ContractSwap {
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
    formatInput(
        data: import('@jelly-swap/types').UserInputSwap,
        receiver: string
    ): import('@jelly-swap/types').ContractSwap {
        throw new Error('Method not implemented.');
    }
    generateId(swap: import('@jelly-swap/types').ContractSwap): string {
        throw new Error('Method not implemented.');
    }
}
