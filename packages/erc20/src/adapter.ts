import { utils } from 'ethers';
import { getExpiration, generateHashLock } from '@jelly-swap/utils';

import { Erc20ContractSwap, Erc20UserInputSwap, Erc20Adapter } from './types';
import Config from './config';

export default class Adapter implements Erc20Adapter {
    private config: any;

    constructor(config = Config()) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: Erc20ContractSwap, sender = this.config.receiverAddress): Erc20ContractSwap {
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        const network = inputSwap.outputNetwork;
        const token = this.config.NameToTokenConfig[network];

        if (!token) {
            throw new Error(`Unsupported ERC20: ${network}`);
        }

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
            tokenAddress: token.address,
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

    parseToNative(amount: string, network: string): string | number {
        const token = this.config.NameToTokenConfig[network];
        if (!token) {
            throw new Error(`Unsupported ERC20: ${network}`);
        }

        return utils.parseUnits(amount, token.decimals).toString();
    }

    parseFromNative(amount: string, network: string): string | number {
        const token = this.config.NameToTokenConfig[network];
        if (!token) {
            throw new Error(`Unsupported ERC20: ${network}`);
        }

        return utils.formatUnits(amount, token.decimals);
    }

    formatInput(data: Erc20UserInputSwap, receiver = this.config.receiverAddress): Erc20ContractSwap {
        const { network, secret } = data;

        const token = this.config.NameToTokenConfig[network];

        if (!token) {
            throw new Error(`Unsupported ERC20: ${network}`);
        }

        const inputAmount = utils.parseUnits(String(data.inputAmount), token.decimals).toString();
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            tokenAddress: token.address,
            expiration,
            hashLock: generateHashLock(secret),
            inputAmount,
            receiver,
            network,
        };
    }

    generateId(swap: Erc20ContractSwap): string {
        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256', 'address'],
            [swap.sender, swap.receiver, swap.inputAmount, swap.hashLock, swap.expiration, swap.tokenAddress]
        );
    }
}
