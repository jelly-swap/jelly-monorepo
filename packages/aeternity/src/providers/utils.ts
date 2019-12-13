import { ContractRefund, ContractWithdraw, ContractSwap } from '@jelly/types';
import { fixHash } from '@jelly/utils';

export const getInputFromRefund = (refund: ContractRefund) => {
    const id = fixHash(refund.id, false);
    return [id];
};

export const getInputFromWithdraw = (withdraw: ContractWithdraw) => {
    const secret = fixHash(withdraw.secret, false);
    const id = fixHash(withdraw.id, false);
    return [id, secret];
};

export const getInputFromSwap = (swap: ContractSwap) => {
    const hashLock = fixHash(swap.hashLock, false);
    return [swap.outputAmount, swap.expiration, hashLock, swap.receiver, swap.outputNetwork, swap.outputAddress];
};
