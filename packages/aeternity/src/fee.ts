import BigNumber from 'bignumber.js';
import { TxBuilder } from '@aeternity/aepp-sdk/es';

const MAX_UINT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const TO = 'ak_2cjPjJJfKSosxSs3HY9mU7CW5DfAC1ywxzzps8EzaR3rpUVeTH';

export const tranferFee = async (provider: any, balance: any) => {
    const MAGNITUDE = 18;

    const MIN_FEE = TxBuilder.calculateMinFee('spendTx', { senderId: TO, amount: MAX_UINT });

    const txFee = new BigNumber(MIN_FEE).shiftedBy(-MAGNITUDE).toString();

    const amount = new BigNumber(balance).minus(txFee).toString();

    const maxAmount = balance;

    return { txFee, amount, maxAmount, feeAsset: 'AE', gasPrice: 1000000000, gasLimit: 15000 };
};
