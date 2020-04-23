import { BitcoinWallet } from '@jelly-swap/types';

import { JellyContract, ContractSwap, BtcContractRefund, BtcContractWithdraw } from './types';

import Config from './config';
import HTLC from './htlc';
import EventHandler from './events';

export default class BitcoinContract implements JellyContract {
    public config: any;

    private contract: HTLC;
    private wallet: BitcoinWallet;
    private eventHandler: EventHandler;

    constructor(wallet: BitcoinWallet, config = Config()) {
        this.wallet = wallet;
        this.config = config;
        this.contract = new HTLC(wallet);
        this.eventHandler = new EventHandler(this.config.apiProviderUrl);
    }

    subscribe(onMessage: Function, filter?: any): void {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: any) {
        return await this.eventHandler.getPast(type, filter);
    }

    async getCurrentBlock(): Promise<string | number> {
        return await this.wallet.getCurrentBlock();
    }

    async getBalance(_address: string): Promise<string | number> {
        return await this.wallet.getBalance();
    }

    async newContract(swap: ContractSwap): Promise<string> {
        const metadata = {
            eventName: 'NEW_CONTRACT',
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

    async withdraw(withdraw: BtcContractWithdraw): Promise<string> {
        const metadata = {
            eventName: 'WITHDRAW',
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

    async refund(refund: BtcContractRefund): Promise<string> {
        const metadata = {
            eventName: 'REFUND',
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

    async getStatus(ids: any[]) {
        return await this.eventHandler.getStatus(ids);
    }
}
