import { ethers, providers } from 'ethers';
import Config from '../config';

export default class JsonProvider extends providers.JsonRpcProvider {
    constructor(providerUrl = Config().providerUrl) {
        super(providerUrl);
    }
}
