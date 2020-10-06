// const algosdk = require('algosdk');
const htlcTemplate = require('algosdk/src/logicTemplates/htlc');

import algosdk from 'algosdk';

import Config from '../config';
import { fundHTLCContract, createHashImg } from './utils';

export default class HTLC {
    algodClient: any;

    constructor() {
        this.algodClient = new algosdk.Algodv2(Config().apiKey, Config().baseServer, '');
    }

    public async create(
        ownerMnemonic: string = 'rather immense option enroll relief gather main thing two alone blind strike equal govern sail color program mad slab normal journey trial vacant absent helmet',
        receiverMnemonic: string = 'wheel harsh foster exclude desert wear puppy lake budget solution transfer syrup mother clay glide boil tourist kite narrow kind woman crouch satisfy abandon one',
        secret: string,
        amount: number = 1000000
    ) {
        try {
            const params = await this.algodClient.getTransactionParams().do();
            const senderWallet = algosdk.mnemonicToSecretKey(ownerMnemonic);
            const receiverWallet = algosdk.mnemonicToSecretKey(receiverMnemonic);

            const owner = senderWallet.addr;
            const receiver = receiverWallet.addr;
            const hashFn = 'sha256';
            const hashImg = createHashImg(secret);

            const expiryRound = 9445278 + 10005;
            const maxFee = 1000;

            const htlc = new htlcTemplate.HTLC(owner, receiver, hashFn, hashImg, expiryRound, maxFee);

            fundHTLCContract(params, htlc, senderWallet, amount, this.algodClient);
        } catch (error) {
            console.log(error);
        }
    }

    public async withdraw(owner: any, receiver: any, secret: any, entropy: string) {
        try {
            const params = await this.algodClient.getTransactionParams().do();

            const hashFn = 'sha256';
            const hashImg = createHashImg(entropy);
            const secret = Buffer.from(
                'd8a928b2043db77e340b523547bf16cb4aa483f0645fe0a290ed1f20aab76257',
                'hex'
            ).toString('base64');

            const maxFee = 1000;

            const htlc = new htlcTemplate.HTLC(
                owner,
                receiver,
                hashFn,
                Buffer.from('c6889fb2b4af9fcc69a6cfd74a48163a17d662d4d32d0321a5aacb23ac0babc8', 'hex').toString(
                    'base64'
                ),
                9445278 + 10005,
                maxFee
            );

            const txn = {
                from: htlc.getAddress(),
                to: receiver,
                fee: 1,
                type: 'pay',
                amount: 0,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisID: params.genesisID,
                genesisHash: params.genesisHash,
                closeRemainderTo: receiver,
            };

            const actualTxn = htlcTemplate.signTransactionWithHTLCUnlock(htlc.getProgram(), txn, secret);

            console.log('Withdraw TX: ', actualTxn);
            let tx = await this.algodClient.sendRawTransaction(actualTxn.blob).do();
            console.log('TX Hash: ', tx);
        } catch (error) {
            console.log('Error withdrawing', error);
        }
    }
}
