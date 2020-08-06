import { utils } from 'ethers';
import { Unit, isBech32Address } from '@harmony-js/utils';
import { toBech32, fromBech32 } from '@harmony-js/crypto';
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
            options: { value: new Unit(inputAmount).toHex() },
        };

        const id = this.generateId(swap);

        return { ...swap, id };
    }

    generateId = (swap: ContractSwap) => {
        const sender = this.parseOutputAddress(swap.sender);
        const receiver = this.parseOutputAddress(swap.receiver);

        return utils.soliditySha256(
            ['address', 'address', 'uint256', 'bytes32', 'uint256'],
            [sender, receiver, swap.inputAmount, swap.hashLock, swap.expiration]
        );
    };

    addressValid = (address: any) => {
        return true;
    };

    parseAddress = (address: any) => {
        if (address) {
            return toBech32(address);
        }
    };

    parseOutputAddress = (address: any) => {
        if (isBech32Address(address)) {
            return fromBech32(address);
        }
        return address;
    };

    parseToNative = (amount: any) => {
        return new Unit(amount).asOne().toWeiString();
    };

    parseFromNative = (amount: any) => {
        return new Unit(amount).toEther();
    };

    formatInput = (data: UserInputSwap, receiver = this.config.receiverAddress) => {
        const value = new Unit(data.inputAmount).asOne().toHex();
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            expiration,
            hashLock: generateHashLock(data.secret),
            inputAmount: value,
            receiver: this.parseOutputAddress(receiver),
            network: this.config.network,
            options: { value },
        };
    };
}
