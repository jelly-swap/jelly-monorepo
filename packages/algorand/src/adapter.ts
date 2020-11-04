import { sha256 } from '@jelly-swap/utils';
import BigNumber from 'bignumber.js';

import { JellyAdapter, ContractSwap } from './types';
import Config from './config';
import { AlgorandProvider } from '@jelly-swap/algo-provider';

export default class AlgoAdapter implements JellyAdapter {
    private config: any;
    private algoProvider: AlgorandProvider;

    constructor(config = Config()) {
        this.config = config;
        this.algoProvider = new AlgorandProvider(this.config.apiProviderUrl);
    }

    createSwapFromInput(inputSwap: ContractSwap, sender = this.config.receiverAddress): any {
        return this.algoProvider.getCurrentBlock()
        .then((currentBlock) => {
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
        }, (err) => {
            throw err;
        })

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

    formatInput(data: any, receiver = this.config.receiverAddress): any {
        return this.algoProvider.getCurrentBlock()
        .then((currentBlock) => {
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
        }, (err) => {
            throw err;
        })

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
