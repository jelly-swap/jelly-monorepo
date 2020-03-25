import { Aex9ContractRefund, Aex9ContractWithdraw, Aex9ContractSwap } from './types';
import { fixHash } from '@jelly-swap/utils';

export const getInputFromRefund = (refund: Aex9ContractRefund) => {
    const id = fixHash(refund.id, false);
    return [id, refund.tokenAddress.replace('ak', 'ct')];
};

export const getInputFromWithdraw = (withdraw: Aex9ContractWithdraw) => {
    const secret = fixHash(withdraw.secret, false);
    const id = fixHash(withdraw.id, false);
    return [id, secret, withdraw.tokenAddress.replace('ak', 'ct')];
};

export const getInputFromSwap = (swap: Aex9ContractSwap) => {
    const hashLock = fixHash(swap.hashLock, false);
    return [
        swap.inputAmount,
        swap.outputAmount,
        swap.expiration,
        hashLock,
        swap.receiver,
        swap.tokenAddress.replace('ak', 'ct'),
        swap.outputNetwork,
        swap.outputAddress,
    ];
};
