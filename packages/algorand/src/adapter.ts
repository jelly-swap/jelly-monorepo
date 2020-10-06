import { generateHashLock, getExpiration, sha256 } from '@jelly-swap/utils';
import BigNumber from 'bignumber.js';

import { JellyAdapter, ContractSwap, UserInputSwap } from './types';
import Config from './config';

export default class BitcoinAdapter implements JellyAdapter {
    private config: any;

    constructor(config = Config()) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: ContractSwap, sender = this.config.receiverAddress): ContractSwap {
        const inputAmount = inputSwap.outputAmount;
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

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
            options: { value: Number(inputSwap.outputAmount) },
        };

        const id = this.generateId(swap);

        return { ...swap, id };
    }

    generateId(swap: ContractSwap): string {
        const idData = JSON.stringify({
            sender: swap.sender,
            receiver: swap.receiver,
            inputAmount: swap.inputAmount,
            hashLock: swap.hashLock,
            expiration: swap.expiration,
        });
        return '0x' + sha256(idData).toString('hex');
    }

    addressValid = (address: any) => {
        return true;
    };

    parseAddress = (address: any) => {
        return address;
    };

    parseOutputAddress = (address: any) => {
        return address;
    };

    parseToNative = (amount: any) => {
        return new BigNumber(amount).multipliedBy(new BigNumber(10).exponentiatedBy(8)).toString();
    };

    parseFromNative = (amount: any) => {
        return new BigNumber(amount).dividedBy(new BigNumber(10).exponentiatedBy(8)).toString();
    };

    formatInput = (data: UserInputSwap, receiver = this.config.receiverAddress) => {
        const inputAmount = this.parseToNative(data.inputAmount);
        const hashLock = generateHashLock(data.secret);

        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            inputAmount,
            hashLock,
            receiver,
            network: 'ALGO',
            expiration,
        };
    };
}
