import BigNumber from 'bignumber.js';

export const tranferFee = async (provider: any, balance: any) => {
    const feePerByte = await provider.getFeePerByte();

    const vBytes = 160; // approx

    const txFee = new BigNumber(feePerByte).multipliedBy(vBytes).div(100000000).toString();

    const amount = balance;

    const maxAmount = new BigNumber(balance).minus(txFee).toString();

    // to keep consistency use gasPrice and gasLimit as terms
    return { txFee, amount, maxAmount, feeAsset: 'BTC', gasPrice: feePerByte, gasLimit: vBytes };
};
