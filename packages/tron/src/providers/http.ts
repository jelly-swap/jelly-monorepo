import TronWeb from 'tronweb';
import TronGrid from 'trongrid';
import Config from '../config';

export default class HttpProvider {
    constructor(providerUrl = Config().providerUrl) {
        return new TronGrid(
            new TronWeb({
                fullNode: providerUrl,
                solidityNode: providerUrl,
                eventServer: providerUrl,
            })
        );
    }
}
