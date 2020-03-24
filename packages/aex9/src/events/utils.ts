import { EventUtils } from '@jelly-swap/aeternity';
import { Filter } from '@jelly-swap/types';
import { filter } from '@jelly-swap/utils';

import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 100, POW_PRECISION: 100 });

const TOPICS = {
    NEW_CONTRACT: 'd3d98a7d52b2b1f51f8e6909ae20f227695f4e6d7fdb9c0052388b59091b6555',
    WITHDRAW: 'c697685b94066657fe65070d9b29384389e827776cd5f0e2270252cfb7e9cf14',
    REFUND: 'c4e6ebe500e9327588e3eb820645ed28c99741f75e762e01faada721269ebab5',
};

export default (tx: any, _filter: Filter, config: any): any => {
    const log = tx.log;

    if (log.length >= 1) {
        const topic = new BigNumber(log[0].topics[0]).toString(16);

        switch (topic) {
            case TOPICS.NEW_CONTRACT: {
                const t = formatNewContractEventData(log[0], config);
                if (filter(_filter.new, t)) {
                    if (_filter.new.sender?.toLowerCase() === t?.sender?.toLowerCase()) {
                        return { ...t, isSender: true };
                    }
                    return t;
                }
                break;
            }

            case TOPICS.REFUND: {
                const t = formatRefundEventData(log[0], config);
                if (filter(_filter.refund, t)) {
                    return t;
                }

                break;
            }

            case TOPICS.WITHDRAW: {
                const t = formatWithdrawEventData(log[0], config);
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

const formatRefundEventData = (log: any, config: any) => {
    const args = EventUtils.decodeString(log);
    const data = log.topics;

    const hashLock = EventUtils.pad64WithPrefix(args[0], false);
    const tokenAddress = args[1];

    const network = config.AddressToToken[tokenAddress].network;

    const id = EventUtils.pad64WithPrefix(data[1]);
    const sender = EventUtils.addressFromDecimal(data[2]);
    const receiver = EventUtils.addressFromDecimal(data[3]);

    const result = {
        eventName: 'REFUND',
        network,
        id,
        sender,
        receiver,
        hashLock,
        tokenAddress,
    };

    return result;
};

const formatWithdrawEventData = (log: any, config: any) => {
    const args = EventUtils.decodeString(log);
    const data = log.topics;

    const secret = EventUtils.pad64WithPrefix(args[0], false);
    const hashLock = EventUtils.pad64WithPrefix(args[1], false);
    const tokenAddress = args[2];

    const network = config.AddressToToken[tokenAddress].network;

    const id = EventUtils.pad64WithPrefix(data[1]);
    const sender = EventUtils.addressFromDecimal(data[2], 'ak_');
    const receiver = EventUtils.addressFromDecimal(data[3], 'ak_');

    const result = {
        eventName: 'WITHDRAW',
        network,
        id,
        sender,
        receiver,
        hashLock,
        secret,
        tokenAddress,
    };

    return result;
};

const formatNewContractEventData = (log: any, config: any) => {
    const args = EventUtils.decodeString(log);
    const data = log.topics;

    const outputNetwork = args[0];
    const outputAddress = args[1];
    const inputAmount = args[2];
    const outputAmount = args[3];
    const expiration = args[4];
    const hashLock = EventUtils.pad64WithPrefix(args[5], false);
    const tokenAddress = args[6];

    const network = config.AddressToToken[tokenAddress].network;

    const id = EventUtils.pad64(data[1]);
    const sender = EventUtils.addressFromDecimal(data[2], 'ak_');
    const receiver = EventUtils.addressFromDecimal(data[3], 'ak_');

    const result = {
        eventName: 'NEW_CONTRACT',
        network,
        id,
        sender,
        receiver,
        outputNetwork,
        outputAddress,
        inputAmount,
        outputAmount,
        expiration,
        hashLock,
        tokenAddress,
    };

    return result;
};

export const mapStatus = (status: string) => {
    return EventUtils.mapStatus(status);
};
