import { ethers } from 'ethers';

import { Erc20JellyContract, Erc20ContractSwap, Erc20ContractRefund, Erc20ContractWithdraw, Options } from './types';

import EventHandler from './events';

import Config from './config';
import ABI from './config/abi';
import ERC20ABI from './config/abi/erc20';

export default class Erc20Contract implements Erc20JellyContract {
    public config: any;
    public contract: ethers.Contract;
    public provider: ethers.providers.BaseProvider;

    private eventHandler: EventHandler;
    private signer: any;

    constructor(provider: any, config = Config()) {
        this.config = config;
        this.provider = provider;
        this.signer = provider.getSigner ? provider.getSigner() : provider;
        this.contract = new ethers.Contract(config.contractAddress, ABI, this.signer);
        this.provider.pollingInterval = config.pollingInterval || Config().pollingInterval;

        this.eventHandler = new EventHandler(this, config);
    }

    unsubscribe() {
        this.eventHandler.unsubscribe();
    }

    subscribe(onMessage: Function, filter?: any): void {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: any, fromBlock?: string | number, toBlock?: string | number) {
        return await this.eventHandler.getPast(type, filter, fromBlock, toBlock);
    }

    async getCurrentBlock(): Promise<string | number> {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string, token: string): Promise<string | number> {
        const tokenAddress = this.config.TokenToAddress(token);
        const tokenContract = this.getTokenContract(tokenAddress);
        return await tokenContract.balanceOf(address, { from: address });
    }

    async newContract(swap: Erc20ContractSwap, options?: Options): Promise<string> {
        const overrideOptions = await this.extendOptions(options);

        const contractAddress = this.config.contractAddress;
        const { inputAmount, sender, tokenAddress } = swap;

        const tokenContract = this.getTokenContract(tokenAddress);

        const allowance = await tokenContract.allowance(sender, contractAddress);

        if (allowance.lt(inputAmount)) {
            await tokenContract.approve(contractAddress, ethers.constants.MaxUint256);

            const result = await this.contract.newContract(
                inputAmount,
                swap.outputAmount,
                swap.expiration,
                swap.hashLock,
                tokenAddress,
                swap.receiver,
                swap.outputNetwork,
                swap.outputAddress,
                { ...overrideOptions, gasLimit: 350000 }
            );
            return result.hash;
        } else {
            const result = await this.contract.newContract(
                inputAmount,
                swap.outputAmount,
                swap.expiration,
                swap.hashLock,
                tokenAddress,
                swap.receiver,
                swap.outputNetwork,
                swap.outputAddress,
                overrideOptions
            );
            return result.hash;
        }
    }

    async withdraw(withdraw: Erc20ContractWithdraw, options?: Options): Promise<string> {
        const overrideOptions = await this.extendOptions(options);

        const result = await this.contract.withdraw(
            withdraw.id,
            withdraw.secret,
            withdraw.tokenAddress,
            overrideOptions
        );
        return result.hash;
    }

    async refund(refund: Erc20ContractRefund, options?: Options): Promise<string> {
        const overrideOptions = await this.extendOptions(options);
        const result = await this.contract.refund(refund.id, refund.tokenAddress, overrideOptions);
        return result.hash;
    }

    async getStatus(ids: any[]) {
        return await this.contract.getStatus(ids, { from: '0x0123456789012345678901234567890123456789' });
    }

    getTokenContract(tokenAddress: string) {
        return new ethers.Contract(tokenAddress, ERC20ABI as any, this.signer);
    }

    async getGas() {
        const providerGas = await this.provider.getGasPrice();
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
