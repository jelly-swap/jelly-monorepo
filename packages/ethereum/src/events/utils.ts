import { Log } from 'ethers/providers';

import { EventFilter } from '@jelly-swap/types';
import { filter } from '@jelly-swap/utils';

export const onFilter = (_filter: EventFilter, data: any, callback: Function) => {
    if (_filter) {
        if (filter(_filter, data)) {
            callback(data);
        }
    } else {
        callback(data);
    }
};

export const fillArrayAfterFilter = (array: any[], _filter: EventFilter, data: any) => {
    if (_filter) {
        if (filter(_filter, data)) {
            array.push(data);
        }
    } else {
        array.push(data);
    }
};

export const parseSwapEvent = (swap: any, log: Log) => ({
    network: 'ETH',
    eventName: 'NEW_CONTRACT',
    ...swap,
    inputAmount: swap.inputAmount.toString(),
    outputAmount: swap.outputAmount.toString(),
    expiration: swap.expiration.toString(),
    transactionHash: log.transactionHash,
});

export const parseEvent = (eventName: string, data: any, log: Log) => ({
    network: 'ETH',
    eventName,
    ...data,
    transactionHash: log.transactionHash,
});
