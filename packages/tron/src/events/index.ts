import TransformNewContract from './newContract';
import TransformWithdraw from './withdraw';
import TransformRefund from './refund';

import Config from '../config';
import Adapter from '../adapter';

export default class Event {
    private contract: any;
    private adapter: Adapter;

    constructor(contract: any) {
        this.contract = contract;
        this.adapter = new Adapter();
    }

    async getPast(type: string, filter?: any, currentBlock?: string | number) {
        switch (type) {
            case 'new': {
                const result = await this._getPast('NewContract', TransformNewContract, filter, currentBlock);
                const ids = result.map((s: any) => s.id);
                const status = await this.contract.getStatus(ids);
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
            const e = await this.contract.provider.contract.getEvents(Config().contractAddress, {
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
                onMessage(result);
            }
        });

        this.contract.contract['Withdraw']().watch((err: any, event: any) => {
            if (err) {
                // TODO: Handle errors
            }

            if (event) {
                const withdraw = TransformWithdraw(event, this.adapter);
                const result = filter ? filter(withdraw) : withdraw;
                onMessage(result);
            }
        });

        this.contract.contract['Refund']().watch((err: any, event: any) => {
            if (err) {
                // TODO: Handle errors
            }

            if (event) {
                const refund = TransformRefund(event, this.adapter);
                const result = filter ? filter(refund) : refund;
                onMessage(result);
            }
        });
    }
}
