import { ContractFactory, Contract } from '@harmony-js/contract';
import { Blockchain } from '@harmony-js/core';
import { Wallet } from '@harmony-js/account';
import { BN } from '@harmony-js/crypto';

import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw, Options } from './types';

import Config from './config';
import ABI from './config/abi';

export default class HarmonyContract implements JellyContract {
    public config: any;
    public contract: Contract;
    public blockchain: Blockchain;

    public provider: Wallet;

    constructor(provider: Wallet, config = Config()) {
        this.config = config;
        this.provider = provider;

        this.blockchain = new Blockchain(provider.messenger);

        const factory = new ContractFactory(provider);
        this.contract = factory.createContract(ABI, config.contractAddress);
    }

    async subscribe(onMessage: Function, filter?: any) {}

    async getPastEvents(type: string, filter: any, fromBlock?: string | number, toBlock?: string | number) {}

    async getCurrentBlock() {
        return await this.blockchain.getBlockNumber();
    }

    async getBalance(address: string) {
        const balance = await this.blockchain.getBalance({ address });
        return balance.toString();
    }

    async newContract(swap: ContractSwap, options?: Options) {
        const overrideOptions = await this.getOptions(options);

        const result = await this.contract.methods
            .newContract(
                swap.outputAmount,
                swap.expiration,
                swap.hashLock,
                swap.receiver,
                swap.outputNetwork,
                swap.outputAddress
            )
            .send({ ...overrideOptions, ...swap.options });

        return result;
    }

    async withdraw(withdraw: ContractWithdraw, options?: Options) {
        const overrideOptions = await this.getOptions(options);
        const result = await this.contract.methods.withdraw(withdraw.id, withdraw.secret).send(overrideOptions);
        return result;
    }

    async refund(refund: ContractRefund, options?: Options) {
        const overrideOptions = await this.getOptions(options);
        const result = await this.contract.methods.refund(refund.id).send(overrideOptions);
        return result;
    }

    async getStatus(ids: any[]) {
        const options = this.getOptions();
        return await this.contract.methods['getStatus(bytes32[])'](ids).call(options);
    }

    async getOptions(options?: Options) {
        if (!options) {
            return {
                gasLimit: new BN('500000'),
                gasPrice: new BN('10000000000'),
            };
        }

        return options;
    }
}
