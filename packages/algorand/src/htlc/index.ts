import Config from '../config';
import { fundHTLCContract, formatNote} from './utils';
import { fixHash, sha256, generateHashLock } from '@jelly-swap/utils';
import { RefundEvent } from '../types';
import {HttpClient} from '../providers';
import algosdk from 'algosdk';

export default class HTLC {
    algodClient: any;
    wallet: any;
    htlcTemplate = require('algosdk/src/logicTemplates/htlc');
    config: any;

    constructor(wallet: any, config = Config()) {
        this.config = config;
        this.algodClient = new HttpClient({ 'X-API-Key': this.config.apiKey }, this.config.baseServer);
        this.wallet = wallet;
    }

    public async newSwap(
        value: number,
        recipientAddress: string,
        refundAddress: string,
        hashLock: string,
        expiration: number = this.config.expiration,
        metadata: any
    ) {
        try {
            const params = await this.algodClient.getTransactionParams();
            const hashFn = 'sha256';
            const htlc = new this.htlcTemplate.HTLC(refundAddress, recipientAddress, hashFn, hashLock, expiration, this.config.maxFee);

            return fundHTLCContract(params, htlc, this.wallet, value, this.algodClient, metadata);
        } catch (error) {
            console.log(error);
        }
    }

    public async withdraw(
        initiationTxHash: string,
        recipientAddress: string,
        refundAddress: string,
        expiration: number,
        secret: string,
        metadata: any,
        secretHash?: any
    ) {
        try {
            const params = await this.algodClient.getTransactionParams();
            const hashFn = 'sha256';
            if (!secretHash) {
                secretHash = sha256(secret);
            }

            const htlc = new this.htlcTemplate.HTLC(
                refundAddress,
                recipientAddress,
                hashFn,
                secretHash,
                expiration,
                this.config.maxFee
            );

            const txn = {
                from: htlc.getAddress(),
                to: Config().zeroAddress,
                fee: 1,
                type: 'pay',
                amount: 0,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisID: params.genesisID,
                genesisHash: params.genesisHash,
                closeRemainderTo: recipientAddress,
                note: formatNote(metadata),
            };
            const args = [];
            args.push(secret);
            const lsig = algosdk.makeLogicSig(htlc.getProgram(), args);
            const rawSignedTxn = algosdk.signLogicSigTransaction(txn, lsig);

            let tx = (await this.algodClient.sendRawTransaction(rawSignedTxn.blob));
            return tx.txId;
        } catch (error) {
            console.log('Error withdrawing', error);
        }
    }

    async refund(
        initiationTxHash: string,
        recipientAddress: string,
        refundAddress: string,
        expiration: number,
        secretHash: any,
        metadata: RefundEvent) {
        try {
            const params = await this.algodClient.getTransactionParams();
            const hashFn = 'sha256';

            const htlc = new this.htlcTemplate.HTLC(
                refundAddress,
                recipientAddress,
                hashFn,
                secretHash,
                expiration,
                this.config.maxFee
            );

            const txn = {
                from: htlc.getAddress(),
                to: Config().zeroAddress,
                fee: 1,
                type: 'pay',
                amount: 0,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisID: params.genesisID,
                genesisHash: params.genesisHash,
                closeRemainderTo: refundAddress,
                note: formatNote(metadata),
            };
            const lsig = algosdk.makeLogicSig(htlc.getProgram(), ['refund']);
            const rawSignedTxn = algosdk.signLogicSigTransaction(txn, lsig);

            let tx = (await this.algodClient.sendRawTransaction(rawSignedTxn.blob));
            return tx.txId;
        } catch (error) {
            console.log('Error refunding', error);
        }

    }

    async getCurrentBlock(): Promise<string | number>  {
        try {
            return await this.algodClient.getCurrentBlock()
        } catch (err) {
            return err;
        }
    }

    async getBalance(_address: string): Promise<string | number>  {
        try {
            return await this.algodClient.accountInformation(_address)
        } catch (err) {
            return err;
        }
    }
}
