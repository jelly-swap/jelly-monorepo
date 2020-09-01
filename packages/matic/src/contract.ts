import { ethers } from 'ethers';

import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw, Options } from './types';

import Config from './config';
import ABI from './config/abi';

export default class MaticContract implements JellyContract {
    public config: any;
    public contract: ethers.Contract;
    public provider: ethers.providers.BaseProvider;

    constructor(provider: any, config = Config()) {
        const signer = provider.getSigner ? provider.getSigner() : provider;

        this.config = config;
        this.contract = new ethers.Contract(this.config.contractAddress, ABI, signer);
        this.provider = provider;
    }

    async subscribe(onMessage: Function, filter?: any) {}

    async getPastEvents(type: string, filter: any, fromBlock?: string | number, toBlock?: string | number) {}

    async getCurrentBlock() {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string) {
        const balance = await this.provider.getBalance(address);
        return balance.toString();
    }

    async newContract(swap: ContractSwap, options?: Options) {
        const overrideOptions = await this.extendOptions(options);
        const result = await this.contract.newContract(
            swap.outputAmount,
            swap.expiration,
            swap.hashLock,
            swap.receiver,
            swap.outputNetwork,
            swap.outputAddress,
            { ...overrideOptions, ...swap.options }
        );
        return result.hash;
    }

    async withdraw(withdraw: ContractWithdraw, options?: Options) {
        const overrideOptions = await this.extendOptions(options);
        const result = await this.contract.withdraw(withdraw.id, withdraw.secret, overrideOptions);
        return result.hash;
    }

    async refund(refund: ContractRefund, options?: Options) {
        const overrideOptions = await this.extendOptions(options);
        const result = await this.contract.refund(refund.id, overrideOptions);
        return result.hash;
    }

    async getStatus(ids: any[]) {}

    async getGas() {
        const providerGas = await ethers.getDefaultProvider().getGasPrice();
        return providerGas.mul(this.config.gasMultiplier || 1);
    }

    async extendOptions(options: Options) {
        if (!options) {
            options = {};
        }

        if (!options.gasPrice) {
            options.gasPrice = await this.getGas();
        }

        return options;
    }
}
