import { utils, Contract } from 'ethers';
import BigNumber from 'bignumber.js';

import ERC20ABI from './config/abi/erc20';

const EXTRA_GAS = 20000;
const TO = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';

export const tranferFee = async (provider: any, balance: any, tokenAddress: string) => {
    const contract = new Contract(tokenAddress, ERC20ABI, provider);

    const gasPrice = await provider.getGasPrice();

    const gasLimit = (await contract.estimate.transfer(TO, Number(balance))).add(EXTRA_GAS);

    const txFee = utils.formatEther(gasPrice.mul(gasLimit));

    const amount = new BigNumber(balance).minus(txFee);

    const maxAmount = balance;

    return { txFee, amount, maxAmount, feeAsset: 'ETH', gasPrice, gasLimit };
};
