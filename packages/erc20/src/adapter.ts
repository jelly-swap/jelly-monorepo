import { utils } from 'ethers';
import { getExpiration, generateHashLock } from '@jelly-swap/utils';

import { JellyAdapter, Erc20ContractSwap, Erc20UserInputSwap } from './types';
import Config from './config';

export default class Erc20Adapter implements JellyAdapter {
    private config: any;

    constructor(token: string, config = Config(token)) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: Erc20ContractSwap, sender = this.config.receiverAddress): Erc20ContractSwap {
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        const network = inputSwap.outputNetwork;

        const result = {
            network,
            outputAmount: inputSwap.inputAmount,
            expiration,
            sender,
            hashLock: inputSwap.hashLock,
            receiver: inputSwap.outputAddress,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount: inputSwap.outputAmount,
            tokenAddress: this.config.address,
        };

        const id = this.generateId(result);

        return { ...result, id };
    }

    addressValid(address: string): boolean {
        return true;
    }

    parseAddress(address: string): string {
        return address.toLowerCase();
    }

    parseOutputAddress(address: string): string {
        return address;
    }

    parseToNative(amount: string): string | number {
        return utils.parseUnits(amount, this.config.decimals).toString();
    }

    parseFromNative(amount: string): string | number {
        return utils.formatUnits(amount, this.config.decimals);
    }

    formatInput(data: Erc20UserInputSwap, receiver = this.config.receiverAddress): Erc20ContractSwap {
        const inputAmount = utils.parseUnits(String(data.inputAmount), this.config.decimals).toString();
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);
        const tokenAddress = data.tokenAddress || this.config.address;

        return {
            ...data,
            tokenAddress,
            expiration,
            hashLock: generateHashLock(data.secret),
            inputAmount,
            receiver,
            network: this.config.network,
        };
    }

    generateId(swap: Erc20ContractSwap): string {
        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256'],
            [swap.sender, swap.receiver, swap.inputAmount, swap.hashLock, swap.expiration]
        );
    }
}
