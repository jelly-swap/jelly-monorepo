import { Providers } from '@jelly-swap/aeternity';

import Config from '../config';
import ContractSource from '../config/contractSource';

export default class HttpProvider extends Providers.HTTP {
    constructor(config = Config(), contractSource = ContractSource, keypair?: any) {
        super(config, contractSource, keypair);
    }

    async getContractInstance(contractSource: string, contractAddress: string) {
        await this.setup();
        return await this.client.getContractInstance(contractSource, { contractAddress });
    }
}
