import { SwapEvent, WithdrawEvent, RefundEvent, Filter } from '@jelly-swap/types';

import { utils } from 'ethers';
import { Log } from 'ethers/providers';

import memoize from 'memoizee';

import { parseSwapEvent, fillArrayAfterFilter, onFilter, parseEvent } from './utils';

import EthereumContract from '../contract';

import Config from '../config';
import ABI from '../config/abi';

export default class Event {
    private config: any;
    private contract: EthereumContract;
    private interface: utils.Interface;
    private cache: Function;

    constructor(contract: EthereumContract, config = Config()) {
        this.config = config;
        this.contract = contract;
        this.interface = new utils.Interface(ABI);
        this.cache = memoize(this._getPast, {
            maxAge: config.cacheAge,
            promise: true,
            normalizer: (a: any[]) => {
                return JSON.stringify(a);
            },
        });
    }

    async getPast(
        type: string,
        _filter?: Filter,
        fromBlock?: string | number,
        toBlock?: string | number
    ): Promise<any> {
        const { swaps, refunds, withdraws } = await this.cache(_filter, fromBlock, toBlock);

        switch (type) {
            case 'new': {
                return await this.getSwapsWithStatus(swaps, _filter);
            }

            case 'withdraw': {
                return withdraws;
            }

            case 'refund': {
                return refunds;
            }

            case 'all': {
                return {
                    swaps: await this.getSwapsWithStatus(swaps, _filter),
                    refunds,
                    withdraws,
                } as any;
            }

            default: {
                throw new Error(`Ivalind event type. Available event types: 'new', 'withdraw', 'refund', 'all'`);
            }
        }
    }

    async getSwapsWithStatus(swaps: SwapEvent[], filter: Filter) {
        const ids = swaps.map((s: any) => s.id);

        const status = await this.contract.getStatus(ids);

        return swaps.map((s: any, index: number) => {
            if (filter?.new?.sender?.toLowerCase() === s.sender.toLowerCase()) {
                return { ...s, status: Number(status[index].toString()), isSender: true };
            }
            return { ...s, status: Number(status[index].toString()) };
        });
    }

    async _getPast(_filter?: Filter, fromBlock?: string | number, toBlock?: string | number) {
        const swaps: SwapEvent[] = [];
        const withdraws: WithdrawEvent[] = [];
        const refunds: RefundEvent[] = [];

        const logsFilter = {
            fromBlock: fromBlock || this.config.originBlock, // TODO: constants
            toBlock: toBlock || 'latest',
            address: this.config.contractAddress,
        };

        const logs = await this.contract.provider.getLogs(logsFilter);

        logs.forEach((log: Log) => {
            const parsed = this.interface.parseLog(log);

            switch (parsed.name) {
                case 'NewContract': {
                    const swap = parseSwapEvent(parsed.values, log);
                    fillArrayAfterFilter(swaps, _filter.new, swap);
                    break;
                }

                case 'Withdraw': {
                    const withdraw = parseEvent('WITHDRAW', parsed.values, log);
                    fillArrayAfterFilter(withdraws, _filter.withdraw, withdraw);
                    break;
                }

                case 'Refund': {
                    const refund = parseEvent('REFUND', parsed.values, log);
                    fillArrayAfterFilter(refunds, _filter.refund, refund);
                    break;
                }
            }
        });

        return { swaps, withdraws, refunds };
    }

    async subscribe(onMessage: Function, _filter?: Filter) {
        this.contract.contract.on(
            {
                address: this.config.contractAddress,
            },
            log => {
                const parsed = this.interface.parseLog(log);

                switch (parsed.name) {
                    case 'NewContract': {
                        const swap = parseSwapEvent(parsed.values, log);
                        onFilter(_filter.new, swap, () => {
                            if (_filter.new.sender?.toLowerCase() === swap.sender.toLowerCase()) {
                                onMessage({ ...swap, isSender: true });
                            } else {
                                onMessage(swap);
                            }
                        });
                        break;
                    }

                    case 'Withdraw': {
                        const withdraw = parseEvent('WITHDRAW', parsed.values, log);
                        onFilter(_filter.withdraw, withdraw, onMessage);
                        break;
                    }

                    case 'Refund': {
                        const refund = parseEvent('REFUND', parsed.values, log);
                        onFilter(_filter.refund, refund, onMessage);
                        break;
                    }
                }
            }
        );
    }
}
