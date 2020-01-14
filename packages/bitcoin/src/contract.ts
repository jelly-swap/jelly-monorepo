import BtcWallet, { Networks } from '@jelly-swap/btc-wallet';
import BtcProvider from '@jelly-swap/btc-provider';
import { safeAccess } from '@jelly-swap/utils';

import { JellyContract, ContractSwap, BtcContractRefund, BtcContractWithdraw } from './types';

import Config from './config';
import HTLC from './htlc';
import EventHandler from './events';

export default class BitcoinContract implements JellyContract {
    private wallet: BtcProvider | BtcWallet;
    private provider: BtcProvider;
    private contract: HTLC;
    private eventHandler: EventHandler;

    constructor(wallet: BtcProvider | BtcWallet, network = Networks.testnet, providerUrl = Config().apiProviderUrl) {
        if (wallet instanceof BtcWallet) {
            this.wallet = wallet;
            this.contract = new HTLC(wallet, network);
            this.provider = safeAccess(wallet, ['provider']);
        } else {
            this.provider = wallet;
        }

        this.eventHandler = new EventHandler(providerUrl);
    }

    subscribe(onMessage: Function, filter?: Function): void {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: Function) {
        return await this.eventHandler.getPast(type, filter);
    }

    async getCurrentBlock(): Promise<string | number> {
        return await this.provider.getBlockHeight();
    }

    async getBalance(_address: string): Promise<string | number> {
        if (this.wallet instanceof BtcWallet) {
            return await this.wallet.getBalance();
        }
        return 0;
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
        return result.txid;
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
