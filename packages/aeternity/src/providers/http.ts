import { Node, RpcAepp, Universal, MemoryAccount } from '../sdk-browser';

import { getInputFromSwap, getInputFromRefund, getInputFromWithdraw } from './utils';

import { ContractSwap, ContractWithdraw, ContractRefund, Provider } from '../types';

import Config from '../config';
import ContractSource from '../config/contractSource';

export default class HttpProvider {
    public config: any;
    public provider: any;
    public contract: any;
    private keypair: any;

    constructor(config = Config(), keypair?: any) {
        this.config = config;
        this.keypair = keypair;
    }

    async setup() {
        if (!this.provider) {
            const node = await Node({ url: this.config.providerUrl, internalUrl: this.config.internalUrl });

            this.provider = await Universal({
                nodes: [{ name: 'JellySwap', instance: node }],
                compilerUrl: this.config.compilerUrl,
                accounts: this.keypair && [MemoryAccount({ keypair: this.keypair })],
            });

            this.contract = await this.provider.getContractInstance(ContractSource, {
                contractAddress: this.config.contractAddress,
            });
        }
    }

    async setupRpc(wallet: any, onAddressChange: Function, onNetworkChange: Function) {
        const node = await Node({ url: this.config.providerUrl, internalUrl: this.config.internalUrl });

        this.provider = await RpcAepp({
            name: 'JellySwap',
            nodes: [{ name: 'testnet', instance: node }],
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
            await this.provider.connectToWallet(connection);

            if (!this.contract) {
                this.contract = await this.provider.getContractInstance(ContractSource, {
                    contractAddress: this.config.contractAddress,
                });
            }

            return await this.provider.subscribeAddress('subscribe', 'current');
        }
    }

    async getCurrentBlock() {
        await this.setup();
        return await this.provider.height();
    }

    async getBalance(address: string) {
        await this.setup();
        return await this.provider.getBalance(address);
    }

    async newContract(swap: ContractSwap) {
        await this.setup();
        const result = await this.contract.methods.new_contract(...getInputFromSwap(swap), swap.options);
        return result;
    }

    async withdraw(withdraw: ContractWithdraw) {
        await this.setup();
        return await this.contract.call('withdraw', getInputFromWithdraw(withdraw));
    }

    async refund(refund: ContractRefund) {
        await this.setup();
        return await this.contract.call('refund', getInputFromRefund(refund));
    }

    async getTxInfo(txHash: string) {
        await this.setup();
        return await this.provider.getTxInfo(txHash);
    }

    async getStatus(ids: any[]) {
        await this.setup();
        const result = await this.contract.methods['get_many_status'](ids);
        return result.decodedResult;
    }
}
