import { ethers } from 'ethers';

import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw } from './types';

import EventHandler from './events';

import Config from './config';
import ABI from './config/abi';

export default class EthereumContract implements JellyContract {
    public config: any;
    public contract: ethers.Contract;
    public provider: ethers.providers.BaseProvider;

    private eventHandler: EventHandler;

    constructor(provider: any, config = Config()) {
        const signer = provider.getSigner ? provider.getSigner() : provider;

        this.config = config;
        this.contract = new ethers.Contract(this.config.contractAddress, ABI, signer);
        this.provider = provider;
        this.provider.pollingInterval = config.pollingInterval || Config().pollingInterval;

        this.eventHandler = new EventHandler(this, this.config);
    }

    async subscribe(onMessage: Function, filter?: any) {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: any, fromBlock?: string | number, toBlock?: string | number) {
        return await this.eventHandler.getPast(type, filter, fromBlock, toBlock);
    }

    async getCurrentBlock() {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string) {
        const balance = await this.provider.getBalance(address);
        return balance.toString();
    }

    async newContract(swap: ContractSwap) {
        const result = await this.contract.newContract(
            swap.outputAmount,
            swap.expiration,
            swap.hashLock,
            swap.receiver,
            swap.outputNetwork,
            swap.outputAddress,
            swap.options
        );
        return result.hash;
    }

    async withdraw(withdraw: ContractWithdraw) {
        const result = await this.contract.withdraw(withdraw.id, withdraw.secret);
        return result.hash;
    }

    async refund(refund: ContractRefund) {
        const result = await this.contract.refund(refund.id);
        return result.hash;
    }

    async getStatus(ids: any[]) {
        // Set `from` in order to be able to call the function without a signer
        return await this.contract.getStatus(ids, { from: '0x0123456789012345678901234567890123456789' });
    }
}
