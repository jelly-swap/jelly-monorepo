import { utils } from 'ethers';
import { Unit } from '@harmony-js/utils';
import { generateHashLock, getExpiration } from '@jelly-swap/utils';

import Config from './config';
import { JellyAdapter, ContractSwap, UserInputSwap } from './types';

export default class HarmonyAdapter implements JellyAdapter {
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
            options: { value: inputAmount },
        };

        const id = this.generateId(swap);

        return { ...swap, id };
    }

    generateId = (swap: ContractSwap) => {
        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256'],
            [swap.sender, swap.receiver, swap.inputAmount, swap.hashLock, swap.expiration]
        );
    };

    addressValid = (address: any) => {
        return true;
    };

    parseAddress = (address: any) => {
        return address.toLowerCase();
    };

    parseOutputAddress = (address: any) => {
        return address;
    };

    parseToNative = (amount: any) => {
        return new Unit(amount).asOne().toWeiString();
    };

    parseFromNative = (amount: any) => {
        return new Unit(amount).toEther();
    };

    formatInput = (data: UserInputSwap, receiver = this.config.receiverAddress) => {
        const value = this.parseToNative(data.inputAmount);
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            expiration,
            hashLock: generateHashLock(data.secret),
            inputAmount: value,
            receiver,
            network: this.config.network,
            options: { value },
        };
    };
}
