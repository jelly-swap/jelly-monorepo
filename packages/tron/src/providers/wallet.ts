import TronWeb from 'tronweb';
import TronGrid from 'trongrid';
import Config from '../config';

export default class WalletProvider {
    constructor(providerUrl = Config().providerUrl, privateKey: string) {
        const tronWeb = new TronWeb({
            fullNode: providerUrl,
            solidityNode: providerUrl,
            eventServer: providerUrl,
        });

        tronWeb.setPrivateKey(privateKey);
        return new TronGrid(tronWeb);
    }
}
