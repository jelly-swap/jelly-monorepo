import TransformNewContract from './newContract';
import TransformWithdraw from './withdraw';
import TransformRefund from './refund';

import Config from '../config';
import Adapter from '../adapter';

export default class Event {
    private config: any;
    private contract: any;
    private adapter: Adapter;

    constructor(contract: any, config = Config()) {
        this.config = config;
        this.contract = contract;
        this.adapter = new Adapter();
    }

    async getStatus(ids: any[]) {
        const contract = this.contract;
        const multiArrayOfIds = chunkArray(ids, 50);

        const result: any[] = await Promise.all(
            multiArrayOfIds.map(ids => {
                return contract.getStatus(ids);
            })
        );

        const statuses = [].concat.apply([], result);
        return statuses;
    }

    async getPast(type: string, filter?: any, currentBlock?: string | number) {
        switch (type) {
            case 'new': {
                const result = await this._getPast('NewContract', TransformNewContract, filter, currentBlock);
                const ids = result.map((s: any) => s.id);
                const status = await this.getStatus(ids);

                return result.map((s: any, index: number) => {
                    return { ...s, status: status[index] };
                });
            }

            case 'withdraw': {
                return await this._getPast('Withdraw', TransformWithdraw, filter, currentBlock);
            }

            case 'refund': {
                return await this._getPast('Refund', TransformRefund, filter, currentBlock);
            }

            default: {
                break;
            }
        }
    }

    async _getPast(eventName: string, transform: Function, filter?: Function, _currentBlock?: string | number) {
        let fingerprint: any;
        let events: any[] = [];

        do {
            const e = await this.contract.provider.contract.getEvents(this.config.contractAddress, {
                event_name: eventName,
                limit: 200,
                only_confirmed: true,
                fingerprint,
            });

            fingerprint = e.meta.fingerprint;

            events = [...events, ...e.data];
        } while (fingerprint);

        const result: any = events.reduce((result, event) => {
            const t = transform(event, this.adapter);
            const f = filter ? filter(t) : t;

            if (f) {
                result.push(f);
            }

            return result;
        }, []);

        return result;
    }

    async subscribe(onMessage: Function, filter?: Function) {
        await this.contract.setup();

        this.contract.contract['NewContract']().watch((err: any, event: any) => {
            if (err) {
                // TODO: Handle errors
            }

            if (event) {
                const swap = TransformNewContract(event, this.adapter);
                const result = filter ? filter(swap) : swap;
                if (result) {
                    onMessage(result);
                }
            }
        });

        this.contract.contract['Withdraw']().watch((err: any, event: any) => {
            if (err) {
                // TODO: Handle errors
            }

            if (event) {
                const withdraw = TransformWithdraw(event, this.adapter);
                const result = filter ? filter(withdraw) : withdraw;
                if (result) {
                    onMessage(result);
                }
            }
        });

        this.contract.contract['Refund']().watch((err: any, event: any) => {
            if (err) {
                // TODO: Handle errors
            }

            if (event) {
                const refund = TransformRefund(event, this.adapter);
                const result = filter ? filter(refund) : refund;
                if (result) {
                    onMessage(result);
                }
            }
        });
    }
}

function chunkArray(arr: any[], size: number) {
    const result = [];

    while (arr.length > size) {
        result.push(arr.splice(0, size));
    }
    result.push(arr.slice(0));

    return result;
}
