import { Wallet } from '@harmony-js/account';
import { Messenger, HttpProvider } from '@harmony-js/network';
import { ChainID, ChainType } from '@harmony-js/utils';

import Config from '../config';

export default class WalletProvider extends Wallet {
    constructor(providerUrl = Config().providerUrl, privateKey?: string) {
        super(new Messenger(new HttpProvider(providerUrl), ChainType.Harmony, ChainID.HmyTestnet));

        if (privateKey) {
            this.addByPrivateKey(privateKey);
        }
    }
}
