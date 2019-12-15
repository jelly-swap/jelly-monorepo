import TronWeb from 'tronweb';
import TronGrid from 'trongrid';
import Config from '../config';

export default class WalletProvider {
    constructor(providerUrl = Config().providerUrl, privateKey: string) {
        return new TronGrid(
            new TronWeb(
                {
                    fullNode: providerUrl,
                    solidityNode: providerUrl,
                    eventServer: providerUrl,
                },
                privateKey
            )
        );
    }
}
