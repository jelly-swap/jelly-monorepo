import BtcWallet from '@jelly-swap/btc-wallet';
import BtcProvider from '@jelly-swap/btc-provider';
import { safeAccess } from '@jelly-swap/utils';

import {
    JellyContract,
    ContractSwap,
    BtcContractRefund,
    BtcContractWithdraw,
} from './types';

import HTLC from './htlc';

export default class BitcoinContract implements JellyContract {
    private wallet: BtcWallet;
    private provider: BtcProvider;
    private contract: HTLC;

    constructor(provider: BtcProvider, wallet: BtcWallet) {
        this.provider = provider;
        this.wallet = wallet;
        this.contract = new HTLC(wallet, provider);
    }
    subscribe(onMessage: Function, filter?: Function): void {
        throw new Error('Method not implemented.');
    }
    getPastEvents(type: string, filter: Function) {
        throw new Error('Method not implemented.');
    }

    getCurrentBlock(): Promise<string | number> {
        throw new Error('Method not implemented.');
    }

    async getBalance(_address: string): Promise<string | number> {
        const balance = safeAccess(this.wallet, ['getBalance']);
        if (balance) {
            return await balance();
        }
        return 0;
    }

    async newContract(swap: ContractSwap): Promise<string> {
        const metadata = {
            eventName: 'REFUND',
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
            swap.inputAmount,
            swap.receiver,
            refundAddress,
            swap.hashLock,
            Number(swap.expiration),
            metadata
        );
        return result.txid;
    }

    async withdraw(withdraw: BtcContractWithdraw): Promise<string> {
        const metadata = {
            eventName: 'WITHDRAW',
            id: withdraw.id,
            hashLock: withdraw.hashLock,
            sender: withdraw.sender,
            receiver: withdraw.receiver,
            secret: withdraw.
        };

        const result = await this.contract.refund(
            withdraw.transactionHash,
            withdraw.receiver,
            withdraw.refundAddress,
            Number(withdraw.expiration),
            withdraw.hashLock,
            metadata
        );

        return result.txid;
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

        return result.txid;
    }

    getStatus(ids: any[]) {
        throw new Error('Method not implemented.');
    }
}
