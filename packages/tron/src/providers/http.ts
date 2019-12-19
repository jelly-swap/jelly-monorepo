import TronWeb from 'tronweb';
import TronGrid from 'trongrid';
import Config from '../config';

export default class HttpProvider {
    constructor(address = Config().receiverAddress, providerUrl = Config().providerUrl) {
        const tronWeb = new TronWeb({
            fullNode: providerUrl,
            solidityNode: providerUrl,
            eventServer: providerUrl,
        });

        tronWeb.setAddress(address);
        return new TronGrid(tronWeb);
    }
}
