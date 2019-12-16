import { w3cwebsocket } from 'websocket';
import axios from 'axios';
import JSONbig from 'json-bigint';
import memoize from 'memoizee';
import { SwapEvent, WithdrawEvent, RefundEvent, Provider } from '../types';

import ParseEvent, { mapStatus } from './utils';

import Config from '../config';

export default class Event {
    private webSocketClient: w3cwebsocket;
    private provider: Provider;
    private history: Map<String, Boolean>;
    private cache: Function;

    constructor(provider: Provider) {
        this.provider = provider;
        this.webSocketClient = new w3cwebsocket(Config().wsUrl);
        this.history = new Map();
        this.cache = memoize(this._getPast, { maxAge: 30000 });
    }

    async getPast(type: string, filter?: Function) {
        const { swaps, refunds, withdraws } = await this.cache(filter);

        switch (type) {
            case 'new': {
                const ids = swaps.map((s: SwapEvent) => s.id);
                const status = await this.provider.getStatus(ids);

                return swaps.map((s: SwapEvent, index: number) => {
                    return { ...s, status: mapStatus(status[index]), id: '0x' + s.id };
                });
            }

            case 'withdraw': {
                return withdraws;
            }

            case 'refund': {
                return refunds;
            }

            default: {
                return { swaps, refunds, withdraws };
            }
        }
    }

    async _getPast(filter: Function) {
        return axios
            .get(`${Config().apiUrl}middleware/contracts/calls/address/${Config().contractAddress}`, {
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

    async subscribe(onMessage: Function, filter?: Function) {
        this.webSocketClient.onopen = () => {
            this.webSocketClient.send(
                JSON.stringify({
                    op: 'Subscribe',
                    payload: 'Object',
                    target: Config().contractAddress,
                })
            );
        };

        this.webSocketClient.onmessage = async (message: any) => {
            if (message.type === 'message' && message.data.includes('payload')) {
                const data = JSON.parse(message.data);

                if (data.payload.hash) {
                    const tx = await this.provider.getTxInfo(data.payload.hash);
                    const swap = ParseEvent(tx, filter);
                    if (swap) {
                        const key = `${swap.eventName}_${swap.id}`;
                        if (!this.history.get(key)) {
                            onMessage({ ...swap, transactionHash: data.payload.hash });
                            this.history.set(key, true);
                        }
                    }
                }
            }
        };

        this.webSocketClient.onerror = (error: any) => {
            console.log('ERROR: ', error);
        };
    }
}
