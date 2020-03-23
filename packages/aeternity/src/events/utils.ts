import { Filter } from '@jelly-swap/types';
import { filter } from '@jelly-swap/utils';

import BigNumber from 'bignumber.js';

import { decodeBase64Check, addressFromDecimal } from '../sdk-browser';

BigNumber.config({ EXPONENTIAL_AT: 100, POW_PRECISION: 100 });

const TOPICS = {
    NEW_CONTRACT: 'd3d98a7d52b2b1f51f8e6909ae20f227695f4e6d7fdb9c0052388b59091b6555',
    WITHDRAW: 'c697685b94066657fe65070d9b29384389e827776cd5f0e2270252cfb7e9cf14',
    REFUND: 'c4e6ebe500e9327588e3eb820645ed28c99741f75e762e01faada721269ebab5',
};

export default (tx: any, _filter: Filter): any => {
    const log = tx.log;

    if (log.length === 1) {
        const topic = new BigNumber(log[0].topics[0]).toString(16);

        switch (topic) {
            case TOPICS.NEW_CONTRACT: {
                const t = formatNewContractEventData(log[0]);
                if (filter(_filter.new, t)) {
                    if (_filter.new.sender?.toLowerCase() === t?.sender?.toLowerCase()) {
                        return { ...t, isSender: true };
                    }
                    return t;
                }
                break;
            }

            case TOPICS.REFUND: {
                const t = formatRefundEventData(log[0]);
                if (filter(_filter.refund, t)) {
                    return t;
                }

                break;
            }

            case TOPICS.WITHDRAW: {
                const t = formatWithdrawEventData(log[0]);
                if (filter(_filter.withdraw, t)) {
                    return t;
                }
            }

            default: {
                return null;
            }
        }
    }
};

const formatRefundEventData = (log: any) => {
    const args = decodeString(log);
    const data = log.topics;

    const hashLock = pad64WithPrefix(args[0], false);
    const id = pad64WithPrefix(data[1]);

    const sender = addressFromDecimal(data[2]);
    const receiver = addressFromDecimal(data[3]);

    const result = {
        eventName: 'REFUND',
        network: 'AE',
        id,
        sender,
        receiver,
        hashLock,
    };

    return result;
};

const formatWithdrawEventData = (log: any) => {
    const args = decodeString(log);
    const data = log.topics;

    const secret = pad64WithPrefix(args[0], false);
    const hashLock = pad64WithPrefix(args[1], false);

    const id = pad64WithPrefix(data[1]);

    const sender = addressFromDecimal(data[2], 'ak_');
    const receiver = addressFromDecimal(data[3], 'ak_');

    const result = {
        eventName: 'WITHDRAW',
        network: 'AE',
        id,
        sender,
        receiver,
        hashLock,
        secret,
    };

    return result;
};

const formatNewContractEventData = (log: any) => {
    const args = decodeString(log);
    const data = log.topics;

    const outputNetwork = args[0];
    const outputAddress = args[1];
    const inputAmount = args[2];
    const outputAmount = args[3];
    const expiration = args[4];
    const hashLock = pad64WithPrefix(args[5], false);

    const id = pad64(data[1]);
    const sender = addressFromDecimal(data[2], 'ak_');
    const receiver = addressFromDecimal(data[3], 'ak_');

    const result = {
        eventName: 'NEW_CONTRACT',
        network: 'AE',
        id,
        sender,
        receiver,
        outputNetwork,
        outputAddress,
        inputAmount,
        outputAmount,
        expiration,
        hashLock,
    };

    return result;
};

export const decodeString = (log: any) => {
    return decodeBase64Check(log.data.slice(3))
        .toString('utf-8')
        .split(',');
};

export const pad64 = (val: string, big = true) => {
    if (big) {
        return new BigNumber(val)
            .toString(16)
            .toLowerCase()
            .padStart(64, '0');
    } else {
        return val.toLowerCase().padStart(64, '0');
    }
};

export const pad64WithPrefix = (val: string, big = true) => {
    return '0x' + pad64(val, big);
};

export const mapStatus = (status: string) => {
    return BLOCKCHAIN_STATUS[status];
};

export type BlockchainStatusOptions = {
    [key: string]: number;
};

const BLOCKCHAIN_STATUS: BlockchainStatusOptions = {
    ACTIVE: 1,
    REFUNDED: 2,
    WITHDRAWN: 3,
    EXPIRED: 4,
    PENDING: 5,
};
