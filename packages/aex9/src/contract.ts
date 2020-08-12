import BigNumber from 'bignumber.js';

import { Aex9JellyContract, Aex9ContractSwap, Aex9ContractWithdraw, Aex9ContractRefund } from './types';

import Aex9Source from './config/aex9';

import { Config } from '.';
import { getInputFromSwap, getInputFromWithdraw, getInputFromRefund } from './utils';

const MAX_ALLOWANCE = '1000000000000000000000000000000000000000000000000000000000000'; // This can be improved
export default class AeternityContract implements Aex9JellyContract {
    public config: any;
    public provider: any;

    constructor(provider: any, config = Config()) {
        this.config = config;
        this.provider = provider;
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

    async newContract(swap: Aex9ContractSwap, checkAllowance = false, options = { waitMined: false }) {
        const contractAddress = this.config.contractAddress.replace('ct', 'ak');
        const { inputAmount, sender, tokenAddress } = swap;

        if (checkAllowance) {
            const tokenContract = await this.getTokenContract(tokenAddress.replace('ak', 'ct'));

            const allowanceResult = await tokenContract.methods.allowance({
                from_account: sender,
                for_account: contractAddress,
            });

            const allowance = new BigNumber(allowanceResult?.decodedResult || 0);

            if (allowance.lt(inputAmount)) {
                await tokenContract.methods.create_allowance(contractAddress, MAX_ALLOWANCE);
                return await this.provider.callContract('new_swap', getInputFromSwap(swap), options);
            }
        }

        return await this.provider.callContract('new_swap', getInputFromSwap(swap), options);
    }

    async withdraw(withdraw: Aex9ContractWithdraw, options = { waitMined: false }) {
        return await this.provider.callContract('withdraw', getInputFromWithdraw(withdraw), options);
    }

    async refund(refund: Aex9ContractRefund, options = { waitMined: false }) {
        return await this.provider.callContract('refund', getInputFromRefund(refund), options);
    }

    async getTokenContract(tokenAddress: string) {
        return await this.provider.getContractInstance(Aex9Source, tokenAddress);
    }
}
