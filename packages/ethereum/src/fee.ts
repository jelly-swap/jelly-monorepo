import { utils } from 'ethers';
import BigNumber from 'bignumber.js';

export const tranferFee = async (provider: any, balance: any) => {
    const gasPrice = await provider.getGasPrice();

    const gasLimit = 21000;

    const txFee = utils.formatEther(gasPrice.mul(gasLimit));

    const amount = new BigNumber(balance).minus(txFee).toString();

    const maxAmount = amount;

    return { txFee, amount, maxAmount, feeAsset: 'ETH', gasPrice, gasLimit };
};
