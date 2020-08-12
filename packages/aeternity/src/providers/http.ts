import { Node, RpcAepp, Universal, MemoryAccount } from '../sdk-browser';

import Config from '../config';
import ContractSource from '../config/contractSource';
import { Provider } from '../types';

export default class HttpProvider implements Provider {
    public config: any;
    public client: any;
    public contract: any;

    private contractSource: string;
    private keypair: any;

    constructor(config = Config(), keypair?: any, contractSource = ContractSource) {
        this.config = config;
        this.contractSource = contractSource;
        this.keypair = keypair;
    }

    async setup() {
        if (!this.client) {
            const node = await Node({ url: this.config.providerUrl, internalUrl: this.config.internalUrl });

            this.client = await Universal({
                nodes: [{ name: 'JellySwap', instance: node }],
                compilerUrl: this.config.compilerUrl,
                accounts: this.keypair && [MemoryAccount({ keypair: this.keypair })],
            });

            this.contract = await this.client.getContractInstance(this.contractSource, {
                contractAddress: this.config.contractAddress,
            });
        }
    }

    async setupRpc(wallet: any, onAddressChange: Function, onNetworkChange: Function) {
        const node = await Node({ url: this.config.providerUrl, internalUrl: this.config.internalUrl });

        this.client = await RpcAepp({
            name: 'JellySwap',
            nodes: [{ name: this.config.nodeName, instance: node }],
            compilerUrl: this.config.compilerUrl,

            onNetworkChange: (network: any) => {
                onNetworkChange(network);
            },
            onAddressChange: async (addresses: any) => {
                onAddressChange(addresses);
            },
        });

        const connection = await wallet.getConnection();

        if (connection) {
            await this.client.connectToWallet(connection);

            if (!this.contract) {
                this.contract = await this.client.getContractInstance(this.contractSource, {
                    contractAddress: this.config.contractAddress,
                });
            }

            return await this.client.subscribeAddress('subscribe', 'current');
        }
    }

    async callContract(method: string, args: any[], options?: any) {
        await this.setup();
        console.log(method, args, options);
        return await this.contract.methods[method](...args, options);
    }

    async getCurrentBlock() {
        await this.setup();
        return await this.client.height();
    }

    async getAeBalance(address: string) {
        await this.setup();
        return await this.client.getBalance(address);
    }

    async getTxInfo(txHash: string) {
        await this.setup();
        return await this.client.getTxInfo(txHash);
    }
}
