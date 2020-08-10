import { Wallet } from '@harmony-js/account';
import { Messenger, HttpProvider } from '@harmony-js/network';
import { TransactionFactory } from '@harmony-js/transaction';
import { ChainID, ChainType } from '@harmony-js/utils';

import Config from '../config';

export default class WalletProvider extends Wallet {
    private transactionFactory: TransactionFactory;

    constructor(providerUrl = Config().providerUrl, privateKey?: string) {
        const messenger = new Messenger(new HttpProvider(providerUrl), ChainType.Harmony, ChainID.HmyTestnet);
        super(messenger);

        this.transactionFactory = new TransactionFactory(messenger);

        if (privateKey) {
            this.addByPrivateKey(privateKey);
        }
    }

    async sendTransaction(receiver: string, value: string) {
        const txn = this.transactionFactory.newTx({
            to: receiver,
            value,
            gasLimit: '210000',
            gasPrice: '100000000000',
        });

        const signedTxn = await this.signTransaction(txn);

        await signedTxn.sendTransaction();

        return signedTxn as any;
    }
}
