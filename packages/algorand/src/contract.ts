import { AlgorandWallet } from '@jelly-swap/types';

import { JellyContract, AlgoContractRefund, AlgoContractWithdraw, AlgoSwap } from './types';
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

    async newContract(swap: AlgoSwap): Promise<string> {
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
            expireBlock: swap.expireBlock,
        };

        const refundAddress = swap.sender;

        return await this.contract.newSwap(
            Number(swap.inputAmount),
            swap.receiver,
            refundAddress,
            swap.hashLock,
            Number(swap.expireBlock),
            metadata
        );
    }

    async withdraw(withdraw: AlgoContractWithdraw): Promise<string> {
        const metadata = {
            eventName: 'J_WITHDRAW',
            id: withdraw.id,
            hashLock: withdraw.hashLock,
            sender: withdraw.sender.toUpperCase(),
            receiver: withdraw.receiver.toUpperCase(),
            secret: withdraw.secret,
        };

        return await this.contract.withdraw(
            withdraw.receiver.toUpperCase(),
            withdraw.refundAddress.toUpperCase(),
            Number(withdraw.expireBlock),
            withdraw.secret,
            metadata,
            withdraw.hashLock
        );
    }

    async refund(refund: AlgoContractRefund): Promise<string> {
        const metadata = {
            eventName: 'J_REFUND',
            id: refund.id,
            sender: refund.sender.toUpperCase(),
            receiver: refund.receiver.toUpperCase(),
            hashLock: refund.hashLock,
        };

        return await this.contract.refund(
            refund.receiver.toUpperCase(),
            refund.refundAddress.toUpperCase(),
            Number(refund.expireBlock),
            refund.hashLock,
            metadata
        );
    }
}
