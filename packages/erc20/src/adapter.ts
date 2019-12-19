import { utils } from 'ethers';
import { getExpiration, generateHashLock } from '@jelly-swap/utils';

import { JellyAdapter, Erc20ContractSwap, Erc20UserInputSwap } from './types';
import Config from './config';

export default class Erc20Adapter implements JellyAdapter {
    private erc20Config: any;

    constructor(token: string) {
        this.erc20Config = Config(token);
    }

    createSwapFromInput(inputSwap: Erc20ContractSwap, sender?: string): Erc20ContractSwap {
        const expiration = getExpiration(this.erc20Config.expiration, 'second', this.erc20Config.unix);

        const network = inputSwap.outputNetwork;

        const result = {
            network,
            outputAmount: inputSwap.inputAmount,
            expiration,
            sender: this.erc20Config.receiverAddress,
            hashLock: inputSwap.hashLock,
            receiver: inputSwap.outputAddress,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount: inputSwap.outputAmount,
            tokenAddress: this.erc20Config.address,
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
        return utils.parseUnits(amount, this.erc20Config.decimals).toString();
    }

    parseFromNative(amount: string): string | number {
        return utils.formatUnits(amount, this.erc20Config.decimals);
    }

    formatInput(data: Erc20UserInputSwap, receiver = this.erc20Config.receiverAddress): Erc20ContractSwap {
        const inputAmount = utils.parseUnits(String(data.inputAmount), this.erc20Config.decimals).toString();
        const expiration = getExpiration(this.erc20Config.expiration, 'second', this.erc20Config.unix);
        const tokenAddress = data.tokenAddress || this.erc20Config.address;

        return {
            ...data,
            tokenAddress,
            expiration,
            hashLock: generateHashLock(data.secret),
            inputAmount,
            receiver,
            network: this.erc20Config.network,
        };
    }

    generateId(swap: Erc20ContractSwap): string {
        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256'],
            [swap.sender, swap.receiver, swap.inputAmount, swap.hashLock, swap.expiration]
        );
    }
}
