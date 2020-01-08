import TronWeb from 'tronweb';
import TronGrid from 'trongrid';
import Config from '../config';

export default class WalletProvider {
    constructor( privateKey: string, providerUrl = Config().providerUrl) {
        const tronWeb = new TronWeb({
            fullNode: providerUrl,
            solidityNode: providerUrl,
            eventServer: providerUrl,
        });

        tronWeb.setPrivateKey(privateKey);
        return new TronGrid(tronWeb);
    }
}
