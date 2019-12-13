import { ContractSwap, UserInputSwap, JellyAdapter } from './types';
import { generateHashLock, getExpiration, sha256, fixHash } from '@jelly/utils';
import BigNumber from 'bignumber.js';

import Config from './config';

export default class AeternityAdapter implements JellyAdapter {
    private AeConfig: any;

    constructor() {
        this.AeConfig = Config();
    }

    createSwapFromInput(inputSwap: ContractSwap, sender = this.AeConfig.receiverAddress): ContractSwap {
        const inputAmount = inputSwap.outputAmount;

        const expiration = getExpiration(this.AeConfig.expiration, 'second', this.AeConfig.unix);

        const swap: ContractSwap = {
            network: inputSwap.outputNetwork,
            outputAmount: inputSwap.inputAmount,
            expiration,
            sender,
            hashLock: inputSwap.hashLock,
            receiver: inputSwap.outputAddress,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount,
            options: { amount: inputAmount },
        };

        const id = this.generateId(swap);

        return { ...swap, id };
    }

    addressValid = (address: string) => {
        return true;
    };

    parseAddress = (address: string) => {
        return address;
    };

    parseOutputAddress = (address: string) => {
        return address;
    };

    parseToNative = (amount: string | number) => {
        return new BigNumber(amount).multipliedBy(1000000000000000000).toString();
    };

    parseFromNative = (amount: string) => {
        return new BigNumber(amount).dividedBy(1000000000000000000).toString();
    };

    formatInput = (swap: UserInputSwap, receiver = this.AeConfig.receiverAddress): ContractSwap => {
        const inputAmount = this.parseToNative(swap.inputAmount);

        const expiration = getExpiration(this.AeConfig.expiration, 'second', this.AeConfig.unix);

        return {
            ...swap,
            expiration,
            hashLock: generateHashLock(swap.secret),
            inputAmount,
            receiver,
            network: this.AeConfig.network,
            options: { amount: inputAmount },
        };
    };

    generateId = (swap: ContractSwap) => {
        const input =
            swap.sender +
            swap.receiver +
            swap.inputAmount +
            fixHash(swap.hashLock, false).toUpperCase() +
            swap.expiration;

        const id = '0x' + sha256(input).toString('hex');
        return id;
    };
}
