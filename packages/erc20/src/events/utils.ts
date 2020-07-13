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

export const parseSwapEvent = (swap: any, log: Log, config: any) => {
    const tokenAddress = swap.tokenAddress.toLowerCase();

    const token = config.AddressToToken[tokenAddress];

    if (!token) {
        throw new Error(`Unsupported ERC20: ${tokenAddress}`);
    }

    return {
        network: token.network,
        eventName: 'NEW_CONTRACT',
        ...swap,
        tokenAddress,
        inputAmount: swap.inputAmount.toString(),
        outputAmount: swap.outputAmount.toString(),
        expiration: swap.expiration.toString(),
        transactionHash: log.transactionHash,
    };
};

export const parseEvent = (eventName: string, data: any, log: Log, config: any) => {
    const tokenAddress = data.tokenAddress.toLowerCase();

    const token = config.AddressToToken[tokenAddress];

    if (!token) {
        throw new Error(`Unsupported ERC20: ${tokenAddress}`);
    }

    return {
        network: token.network,
        eventName,
        ...data,
        tokenAddress,
        transactionHash: log.transactionHash,
    };
};
