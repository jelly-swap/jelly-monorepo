import { ContractFactory, Contract } from '@harmony-js/contract';
import { Blockchain } from '@harmony-js/core';
import { Wallet } from '@harmony-js/account';
import { BN } from '@harmony-js/crypto';

import { JellyContract, ContractSwap, ContractRefund, ContractWithdraw, Options } from './types';

import Config from './config';
import ABI from './config/abi';
import { Unit } from '@harmony-js/utils';

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
        const blockNumber = await this.blockchain.getBlockNumber();
        return blockNumber.result || 0;
    }

    async getBalance(address: string) {
        const balance = await this.blockchain.getBalance({ address });
        if (balance.result) {
            return new Unit(balance.result).toWeiString();
        }
        return 0;
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

        if (result?.transaction?.txStatus === 'REJECTED') {
            throw new Error('TX REJECTED');
        }

        return result?.transaction?.id;
    }

    async withdraw(withdraw: ContractWithdraw, options?: Options) {
        const overrideOptions = await this.getOptions(options);
        const result = await this.contract.methods.withdraw(withdraw.id, withdraw.secret).send(overrideOptions);

        if (result?.transaction?.txStatus === 'REJECTED') {
            throw new Error('TX REJECTED');
        }

        return result?.transaction?.id;
    }

    async refund(refund: ContractRefund, options?: Options) {
        const overrideOptions = await this.getOptions(options);
        const result = await this.contract.methods.refund(refund.id).send(overrideOptions);

        if (result?.transaction?.txStatus === 'REJECTED') {
            throw new Error('TX REJECTED');
        }

        return result?.transaction?.id;
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
                waitConfirm: false,
            };
        }

        return {
            ...options,
            gasLimit: options.gasLimit || new BN('500000'),
            gasPrice: options.gasPrice || new BN('10000000000'),
            waitConfirm: false,
        };
    }
}
