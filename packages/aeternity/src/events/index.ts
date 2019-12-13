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
        this.webSocketClient = new w3cwebsocket('wss://testnet.aeternal.io/websocket');
        this.history = new Map();
        this.cache = memoize(this._getPast, { maxAge: 30000 });
    }

    async getPast(type: string, filter?: any) {
        const result = await this.cache();

        switch (type) {
            case 'new': {
                const swaps = filter ? filter(result.swaps) : result.swaps;
                const ids = swaps.map((s: SwapEvent) => s.id);
                const status = await this.provider.getStatus(ids);

                return swaps.map((s: SwapEvent, index: number) => {
                    return { ...s, status: mapStatus(status[index]), id: '0x' + s.id };
                });
            }

            case 'withdraw': {
                return filter ? filter(result.withdraws) : result.withdraws;
            }

            case 'refund': {
                return filter ? filter(result.refunds) : result.refunds;
            }

            default: {
                return result;
            }
        }
    }

    async _getPast() {
        return axios
            .get(`${Config().apiUrl}middleware/contracts/calls/address/${Config().contractAddress}`, {
                transformResponse: [(data: any) => data],
            })
            .then((res: any) => {
                const swaps: SwapEvent[] = [];
                const withdraws: WithdrawEvent[] = [];
                const refunds: RefundEvent[] = [];

                JSONbig.parse(res.data).map((tx: any) => {
                    const result = ParseEvent(tx.callinfo);

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
                    const result = ParseEvent(tx);
                    const swap = filter ? filter(result) : result;
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
