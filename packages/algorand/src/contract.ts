import { JellyContract, ContractSwap, AlgoContractRefund, AlgoContractWithdraw } from './types';
import { AlgorandWallet } from '@jelly-swap/types';

import Config from './config';
import HTLC from './htlc';

export default class AlgoContract implements JellyContract {
    public config: any;

    private contract: HTLC;

    constructor(wallet: AlgorandWallet, config = Config()) {
        this.config = config;
        this.contract = new HTLC(wallet, config);
    }

    async getCurrentBlock(): Promise<string | number> {
        return await this.contract.getCurrentBlock();
    }

    async getBalance(_address: string): Promise<string | number> {
        return await this.contract.getBalance(_address);
    }

    async newContract(swap: ContractSwap): Promise<string> {
        const metadata = {
            eventName: 'J_NEW_CONTRACT',
            id: swap.id,
            sender: swap.sender,
            receiver: swap.receiver,
            hashLock: swap.hashLock,
            outputNetwork: swap.outputNetwork,
            refundAddress: swap.sender,
            outputAddress: swap.outputAddress,
            inputAmount: swap.inputAmount,
            outputAmount: swap.outputAmount,
            expiration: swap.expiration,
        };

        const refundAddress = swap.sender;

        const result = await this.contract.newSwap(
            Number(swap.inputAmount),
            swap.receiver,
            refundAddress,
            swap.hashLock,
            Number(swap.expiration),
            metadata
        );
        return result;
    }

    async withdraw(withdraw: AlgoContractWithdraw): Promise<string> {
        const metadata = {
            eventName: 'J_WITHDRAW',
            id: withdraw.id,
            hashLock: withdraw.hashLock,
            sender: withdraw.sender,
            receiver: withdraw.receiver,
            secret: withdraw.secret,
        };

        const result = await this.contract.withdraw(
            withdraw.transactionHash,
            withdraw.receiver,
            withdraw.refundAddress,
            Number(withdraw.expiration),
            withdraw.secret,
            metadata,
            withdraw.hashLock
        );

        return result;
    }

    async refund(refund: AlgoContractRefund): Promise<string> {
        const metadata = {
            eventName: 'J_REFUND',
            id: refund.id,
            sender: refund.sender,
            receiver: refund.receiver,
            hashLock: refund.hashLock,
        };

        const result = await this.contract.refund(
            refund.transactionHash,
            refund.receiver,
            refund.refundAddress,
            Number(refund.expiration),
            refund.hashLock,
            metadata
        );

        return result;

    }
}
