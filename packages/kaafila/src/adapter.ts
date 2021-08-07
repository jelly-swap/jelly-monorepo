import { AlgorandProvider } from '@jelly-swap/algo-provider';
import { generateHashLock, getExpiration, sha256 } from '@jelly-swap/utils';
import BigNumber from 'bignumber.js';

import { AlgoAdapterInterface, AlgoSwap } from './types';
import Config from './config';

export default class AlgoAdapter implements AlgoAdapterInterface {
    private config: any;
    private algoProvider: AlgorandProvider;

    constructor(config = Config()) {
        this.config = config;
        this.algoProvider = new AlgorandProvider(this.config.providerUrl);
    }

    async createSwapFromInput(inputSwap: AlgoSwap, sender = this.config.receiverAddress): Promise<AlgoSwap> {
        const [currentBlock, blockTime] = await Promise.all([
            this.algoProvider.getCurrentBlock(),
            this.algoProvider.getBlockTime(),
        ]);
        const expireBlock = currentBlock + Math.floor(this.config.expiration / blockTime);
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        const result = {
            network: inputSwap.outputNetwork,
            outputAmount: inputSwap.inputAmount,
            expiration,
            expireBlock,
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

    async formatInput(data: any, receiver = this.config.receiverAddress): Promise<AlgoSwap> {
        const [currentBlock, blockTime] = await Promise.all([
            this.algoProvider.getCurrentBlock(),
            this.algoProvider.getBlockTime(),
        ]);
        const inputAmount = this.parseToNative(data.inputAmount);
        const hashLock = generateHashLock(data.secret);
        const expireBlock = currentBlock + Math.floor(this.config.expiration / blockTime);
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            inputAmount,
            hashLock,
            receiver,
            network: 'ALGO',
            expiration,
            expireBlock,
        };
    }

    generateId(swap: AlgoSwap): string {
        const idData = JSON.stringify({
            sender: swap.sender,
            receiver: swap.receiver,
            inputAmount: swap.inputAmount,
            hashLock: swap.hashLock,
            expiration: swap.expireBlock,
        });
        return '0x' + sha256(idData).toString('hex');
    }
}
