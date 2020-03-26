import { fixHash } from '@jelly-swap/utils';

import { w3cwebsocket } from 'websocket';
import axios from 'axios';
import JSONbig from 'json-bigint';
import memoize from 'memoizee';

import ParseEvent, { mapStatus } from './utils';

import Config from '../config';

import { SwapEvent, WithdrawEvent, RefundEvent, Provider, Filter } from '../types';

export default class Event {
    private config: any;
    private webSocketClient: w3cwebsocket;
    private contract: any;
    private provider: Provider;
    private history: Map<String, Boolean>;
    private cache: Function;

    constructor(contract: any, config = Config()) {
        this.config = config;
        this.contract = contract;
        this.provider = contract.provider;
        this.webSocketClient = new w3cwebsocket(this.config.wsUrl);
        this.history = new Map();
        this.cache = memoize(this._getPast, {
            maxAge: 30000,
            promise: true,
            normalizer: (a: any[]) => {
                return JSON.stringify(a);
            },
        });
    }

    async getPast(type: string, filter?: Filter) {
        const { swaps, refunds, withdraws } = await this.cache(filter);

        switch (type) {
            case 'new': {
                return await this.getSwapsWithStatus(swaps, filter);
            }

            case 'withdraw': {
                return withdraws;
            }

            case 'refund': {
                return refunds;
            }

            case 'all': {
                return {
                    swaps: await this.getSwapsWithStatus(swaps, filter),
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
        const ids = swaps.map((s: SwapEvent) => s.id);

        const status = await this.contract.getStatus(ids);

        return swaps.map((s: any, index: number) => {
            return { ...s, status: mapStatus(status[index]), id: '0x' + s.id };
        });
    }

    async _getPast(filter: Filter) {
        return axios
            .get(`${this.config.apiUrl}middleware/contracts/calls/address/${this.config.contractAddress}`, {
                transformResponse: [(data: any) => data],
            })
            .then((res: any) => {
                const swaps: SwapEvent[] = [];
                const withdraws: WithdrawEvent[] = [];
                const refunds: RefundEvent[] = [];

                JSONbig.parse(res.data).map((tx: any) => {
                    const result = ParseEvent(tx.callinfo, filter);

                    if (result) {
                        const txIncluded = {
                            ...result,
                            transactionHash: tx.transaction_id,
                        };

                        switch (result.eventName) {
                            case 'NEW_CONTRACT': {
                                swaps.push(txIncluded);
                                break;
                            }

                            case 'REFUND': {
                                refunds.push(txIncluded);
                                break;
                            }

                            case 'WITHDRAW': {
                                withdraws.push(txIncluded);
                                break;
                            }
                        }
                    }
                });

                return { swaps, refunds, withdraws };
            });
    }

    async subscribe(onMessage: Function, filter?: Filter) {
        this.webSocketClient.onopen = () => {
            this.webSocketClient.send(
                JSON.stringify({
                    op: 'Subscribe',
                    payload: 'Object',
                    target: this.config.contractAddress,
                })
            );
        };

        this.webSocketClient.onmessage = async (message: any) => {
            if (message.type === 'message' && message.data.includes('payload')) {
                const data = JSON.parse(message.data);
                const txHash = data.payload.hash;

                if (txHash) {
                    try {
                        const tx = await this.provider.getTxInfo(txHash);
                        const result = ParseEvent(tx, filter);

                        if (result) {
                            const key = `${result.eventName}_${txHash}`;
                            if (!this.history.get(key)) {
                                onMessage({ ...result, transactionHash: txHash, id: fixHash(result.id) });
                                this.history.set(key, true);
                            }
                        }
                    } catch (err) {}
                }
            }
        };

        this.webSocketClient.onerror = (error: any) => {
            console.log('ERROR: ', error);
        };
    }
}
