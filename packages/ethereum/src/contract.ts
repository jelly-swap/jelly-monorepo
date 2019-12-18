import { ethers } from 'ethers';

import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw } from './types';

import EventHandler from './events';

import Config from './config';
import ABI from './config/abi';

export default class EthereumContract implements JellyContract {
    public contract: ethers.Contract;
    public provider: ethers.providers.BaseProvider;
    private eventHandler: EventHandler;

    constructor(provider: any) {
        const signer = provider.getSigner ? provider.getSigner() : provider;
        this.contract = new ethers.Contract(Config().contractAddress, ABI, signer);
        this.provider = provider;
        this.eventHandler = new EventHandler(this);
    }

    async subscribe(onMessage: Function, filter?: Function) {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: Function, currentBlock?: string | number) {
        if (!currentBlock) {
            currentBlock = await this.getCurrentBlock();
        }
        return await this.eventHandler.getPast(type, filter, currentBlock);
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
