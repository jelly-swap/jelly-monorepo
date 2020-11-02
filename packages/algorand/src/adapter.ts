import { sha256 } from '@jelly-swap/utils';
import BigNumber from 'bignumber.js';

import { JellyAdapter, ContractSwap } from './types';
import Config from './config';

export default class AlgoAdapter implements JellyAdapter {
    private config: any;

    constructor(config = Config()) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: ContractSwap, sender = this.config.receiverAddress, currentBlock?: number): ContractSwap {
        const expiration = currentBlock + Math.floor(this.config.expiration / this.config.blockTimeSeconds);

        const result = {
            network: inputSwap.outputNetwork,
            outputAmount: inputSwap.inputAmount,
            expiration,
            hashLock: inputSwap.hashLock,
            sender,
            receiver: inputSwap.outputAddress,
            refundAddress: sender,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount: Number(inputSwap.outputAmount),
        };

        const id = this.generateId(result);

        return { ...result, id };
    }

    addressValid = (address: string): boolean => {
        return true;
    };

    parseAddress = (address: string): string => {
        return address;
    };

    parseOutputAddress = (address: string): string => {
        return address;
    };

    parseToNative(amount: string | number): string | number {
        return new BigNumber(amount).multipliedBy(new BigNumber(10).exponentiatedBy(this.config.decimals)).toString();
    }

    parseFromNative(amount: string): string | number {
        return new BigNumber(amount).dividedBy(new BigNumber(10).exponentiatedBy(this.config.decimals)).toString();
    }

    formatInput(data: any, receiver = this.config.receiverAddress, currentBlock?: number): ContractSwap {
        try {
            const inputAmount = this.parseToNative(data.inputAmount);
            const hashLock = this.generateHashLock(data.secret);
            const expiration = currentBlock + Math.floor(this.config.expiration / this.config.blockTimeSeconds);

            return {
                ...data,
                inputAmount,
                hashLock,
                receiver,
                network: 'ALGO',
                expiration,
            };
        } catch (err) {
            return err;
        }
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

    generateHashLock(image: string) {
        return sha256(image);
    }
}
