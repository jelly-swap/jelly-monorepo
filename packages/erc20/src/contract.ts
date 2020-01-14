import { ethers } from 'ethers';

import { Erc20JellyContract, Erc20ContractSwap, Erc20ContractRefund, Erc20ContractWithdraw } from './types';

import EventHandler from './events';

import Config from './config';
import { tokenToAddress } from './config/tokens';
import ABI from './config/abi';
import ERC20ABI from './config/abi/erc20';

export default class Erc20Contract implements Erc20JellyContract {
    public contract: ethers.Contract;
    public provider: ethers.providers.BaseProvider;
    private eventHandler: EventHandler;
    private config: any;

    constructor(provider: any, config = Config()) {
        const signer = provider.getSigner ? provider.getSigner() : provider;
        this.contract = new ethers.Contract(config.contractAddress, ABI, signer);
        this.provider = provider;
        this.eventHandler = new EventHandler(this, config);
        this.config = config;
    }

    subscribe(onMessage: Function, filter?: Function): void {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: Function, currentBlock?: string | number) {
        if (!currentBlock) {
            currentBlock = await this.getCurrentBlock();
        }
        return await this.eventHandler.getPast(type, filter, currentBlock);
    }

    async getCurrentBlock(): Promise<string | number> {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string, token: string): Promise<string | number> {
        const tokenAddress = tokenToAddress(token);
        const tokenContract = this.getTokenContract(tokenAddress);
        return await tokenContract.balanceOf(address, { from: address });
    }

    async newContract(swap: Erc20ContractSwap, checkAllowance = false): Promise<string> {
        const contractAddress = this.config.contractAddress;
        const { inputAmount, sender, tokenAddress } = swap;

        if (checkAllowance) {
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
                    { gasLimit: 350000 }
                );
                return result.hash;
            }
        }

        const result = await this.contract.newContract(
            inputAmount,
            swap.outputAmount,
            swap.expiration,
            swap.hashLock,
            tokenAddress,
            swap.receiver,
            swap.outputNetwork,
            swap.outputAddress
        );
        return result.hash;
    }

    async withdraw(withdraw: Erc20ContractWithdraw): Promise<string> {
        const result = await this.contract.withdraw(withdraw.id, withdraw.secret, withdraw.tokenAddress);
        return result.hash;
    }

    async refund(refund: Erc20ContractRefund): Promise<string> {
        const result = await this.contract.refund(refund.id, refund.tokenAddress);
        return result.hash;
    }

    async getStatus(ids: any[]) {
        return await this.contract.getStatus(ids, { from: '0x0123456789012345678901234567890123456789' });
    }

    getTokenContract(tokenAddress: string) {
        return new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    }
}
