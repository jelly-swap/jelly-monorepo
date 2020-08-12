import { utils } from 'ethers';
import Config from './config';
import { JellyAdapter, ContractSwap, UserInputSwap } from './types';
import { generateHashLock, getExpiration } from '@jelly-swap/utils';

export default class EthereumAdapter implements JellyAdapter {
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
            options: { value: utils.bigNumberify(inputAmount) },
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
        return address;
    };

    parseOutputAddress = (address: any) => {
        return address;
    };

    parseToNative = (amount: any) => {
        return utils.parseEther(amount).toString();
    };

    parseFromNative = (amount: any) => {
        return utils.formatEther(amount);
    };

    formatInput = (data: UserInputSwap, receiver = this.config.receiverAddress) => {
        const value = utils.parseEther(String(data.inputAmount));
        const inputAmount = value.toString();
        const expiration = getExpiration(this.config.expiration, 'second', this.config.unix);

        return {
            ...data,
            expiration,
            hashLock: generateHashLock(data.secret),
            inputAmount,
            receiver,
            network: this.config.network,
            options: { value },
        };
    };
}
