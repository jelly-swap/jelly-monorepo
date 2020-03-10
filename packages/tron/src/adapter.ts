import { getExpiration, generateHashLock } from '@jelly-swap/utils';
import { utils } from 'ethers';
import TronWeb from 'tronweb';

import { JellyAdapter, ContractSwap, TronContractSwap, UserInputSwap } from './types';
import Config from './config';

const ADDRESS_SIZE = 42;
const ADDRESS_PREFIX = '41';

export default class TronAdapter implements JellyAdapter {
    private config: any;

    constructor(config = Config()) {
        this.config = config;
    }

    createSwapFromInput(inputSwap: ContractSwap, sender = this.config.receiverAddress): TronContractSwap {
        const expiration = getExpiration(this.config.expiration, 'seconds', this.config.unix);

        const swap: TronContractSwap = {
            network: inputSwap.outputNetwork,
            outputAmount: inputSwap.inputAmount,
            expiration,
            hashLock: inputSwap.hashLock,
            sender,
            receiver: inputSwap.outputAddress,
            outputNetwork: inputSwap.network,
            outputAddress: inputSwap.receiver,
            inputAmount: inputSwap.outputAmount,
            options: {
                feeLimit: 100000000,
                callValue: inputSwap.outputAmount,
                shouldPollResponse: false,
            },
        };

        const id = this.generateId(swap);

        return { ...swap, id };
    }

    addressValid(address: string): boolean {
        if (address) {
            if (address.length !== ADDRESS_SIZE) {
                return false;
            }

            if (address.slice(0, 2) !== ADDRESS_PREFIX) {
                return false;
            }

            return true;
        }
    }

    parseAddress(address: string): string {
        try {
            const base58 = TronWeb.address.fromHex(address);
            return base58;
        } catch (error) {}
    }

    parseOutputAddress(address: string): string {
        try {
            const tronHex = TronWeb.address.toHex(address);
            const outputAddress = '0x' + tronHex.slice(2);
            return outputAddress;
        } catch (error) {}
    }

    parseToNative(amount: string): string | number {
        return TronWeb.toSun(amount);
    }

    parseFromNative(amount: string): string | number {
        return TronWeb.fromSun(amount);
    }

    formatInput(data: UserInputSwap, receiver = this.config.receiverAddress): TronContractSwap {
        const inputAmount = TronWeb.toSun(data.inputAmount);
        const expiration = getExpiration(this.config.expiration, 'seconds', this.config.unix);

        return {
            ...data,
            hashLock: generateHashLock(data.secret),
            inputAmount,
            expiration,
            network: this.config.network,
            receiver,
            options: {
                feeLimit: 100000000,
                callValue: inputAmount,
                shouldPollResponse: false,
            },
        };
    }

    generateId(swap: ContractSwap): string {
        const tronHex = TronWeb.address.toHex(swap.sender);
        const sender = '0x' + tronHex.slice(2);
        const receiver = '0x' + swap.receiver.slice(2);

        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256'],
            [sender, receiver, swap.inputAmount, swap.hashLock, swap.expiration]
        );
    }
}
