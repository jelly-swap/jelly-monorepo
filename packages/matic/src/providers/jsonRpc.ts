import { providers } from 'ethers';
import Config from '../config';

export default class JsonProvider extends providers.JsonRpcProvider {
    constructor(config = Config()) {
        super(config.providerUrl, config.chainId);
    }
}
