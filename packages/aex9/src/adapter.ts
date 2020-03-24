import { Aex9ContractSwap, Aex9UserInputSwap, JellyAdapter } from './types';
import { generateHashLock, getExpiration, sha256, fixHash } from '@jelly-swap/utils';
import BigNumber from 'bignumber.js';

import Config from './config';

export default class AeternityAdapter implements JellyAdapter {
    private config: any;

    constructor(token: string, config = Config(token)) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: Aex9ContractSwap, sender = this.config.receiverAddress): Aex9ContractSwap {
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        const swap: Aex9ContractSwap = {
            network: inputSwap.outputNetwork,
            outputAmount: inputSwap.inputAmount,
            expiration,
            sender,
            hashLock: inputSwap.hashLock,
            receiver: inputSwap.outputAddress,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount: inputSwap.outputAmount,
            tokenAddress: this.config.address.replace('ak', 'ct'),
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
        return new BigNumber(amount).multipliedBy(Math.pow(10, this.config.decimals)).toString();
    };

    parseFromNative = (amount: string) => {
        return new BigNumber(amount).dividedBy(Math.pow(10, this.config.decimals)).toString();
    };

    formatInput = (swap: Aex9UserInputSwap, receiver = this.config.receiverAddress): Aex9ContractSwap => {
        const inputAmount = this.parseToNative(swap.inputAmount);
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);
        const tokenAddress = swap.tokenAddress || this.config.address;

        return {
            ...swap,
            tokenAddress: tokenAddress.replace('ak', 'ct'),
            expiration,
            hashLock: generateHashLock(swap.secret),
            inputAmount,
            receiver,
            network: this.config.network,
        };
    };

    generateId = (swap: Aex9ContractSwap) => {
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
