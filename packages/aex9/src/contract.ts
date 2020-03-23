import BigNumber from 'bignumber.js';

import { Aex9JellyContract, Aex9ContractSwap, Aex9ContractWithdraw, Aex9ContractRefund } from './types';

import Aex9Source from './config/aex9';

import EventHandler from './events';
import { Config } from '.';
import { getInputFromSwap, getInputFromWithdraw, getInputFromRefund } from './utils';

const MAX_ALLOWANCE = '1000000000000000000000000000000000000000000000000000000000000';
export default class AeternityContract implements Aex9JellyContract {
    public config: any;
    public provider: any;

    private eventHandler: EventHandler;

    constructor(provider: any, config = Config()) {
        this.config = config;
        this.provider = provider;
        this.eventHandler = new EventHandler(this, this.config);
    }

    async subscribe(onMessage: Function, filter: any) {
        this.eventHandler.subscribe(onMessage, filter);
    }

    async getPastEvents(type: string, filter: any) {
        return await this.eventHandler.getPast(type, filter);
    }

    async getCurrentBlock() {
        return await this.provider.getCurrentBlock();
    }

    async getBalance(address: string, token: string): Promise<string | number> {
        const tokenAddress = this.config.TokenToAddress(token);
        const tokenContract = await this.getTokenContract(tokenAddress.replace('ak', 'ct'));
        const result = await tokenContract.methods.balance(address);
        return result?.decodedResult || 0;
    }

    async newContract(swap: Aex9ContractSwap, checkAllowance = false) {
        const contractAddress = this.config.contractAddress.replace('ct', 'ak');
        const { inputAmount, sender, tokenAddress } = swap;

        if (checkAllowance) {
            const tokenContract = await this.getTokenContract(tokenAddress);

            const allowanceResult = await tokenContract.methods.allowance({
                from_account: sender,
                for_account: contractAddress,
            });

            const allowance = new BigNumber(allowanceResult?.decodedResult || 0);

            if (allowance.lt(inputAmount)) {
                await tokenContract.methods.create_allowance(contractAddress, MAX_ALLOWANCE);
                const result = await this.provider.callContract('new_contract', getInputFromSwap(swap));
                return result;
            }
        }

        const result = await this.provider.callContract('new_contract', getInputFromSwap(swap));
        return result;
    }

    async withdraw(withdraw: Aex9ContractWithdraw) {
        const result = await this.provider.callContract('withdraw', getInputFromWithdraw(withdraw));
        return result;
    }

    async refund(refund: Aex9ContractRefund) {
        const result = await this.provider.callContract('refund', getInputFromRefund(refund));
        return result;
    }

    async getStatus(ids: any[]) {
        const result = await this.provider.callContract('get_many_status', [ids]);
        return result?.decodedResult;
    }

    async getTokenContract(tokenAddress: string) {
        await this.provider.setup();
        return await this.provider.client.getContractInstance(Aex9Source, {
            contractAddress: tokenAddress,
        });
    }
}
