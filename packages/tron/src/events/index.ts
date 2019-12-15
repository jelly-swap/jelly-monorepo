import TransformNewContract from './newContract';
import TransformWithdraw from './withdraw';
import TransformRefund from './refund';

import Config from '../config';

export default class Event {
    private contract: any;

    constructor(contract: any) {
        this.contract = contract;
    }

    async getPast(type: string, filter?: any, currentBlock?: string | number) {
        switch (type) {
            case 'new': {
                return await this._getPast('NewContract', TransformNewContract, filter, currentBlock);
            }

            case 'withdraw': {
                return await this._getPast('Withdraw', TransformWithdraw, filter, currentBlock);
            }

            case 'refund': {
                return await this._getPast('Refund', TransformRefund, filter, currentBlock);
            }

            default: {
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
            const t = transform(event);
            const f = filter ? filter(t) : t;

            if (f) {
                result.push(t);
            }

            return result;
        }, []);

        const ids = result.map((s: any) => s.id);

        const status = await this.contract.getStatus(ids);

        return result.map((s: any, index: number) => {
            return { ...s, status: status[index] };
        });
    }

    async subscribe(onMessage: Function, filter?: Function) {
        await this.contract.setup();

        this.contract['NewContract']().watch(function(err: any, swap: any) {
            if (err) {
                // TODO: Handle errors
            }

            if (swap) {
                TransformNewContract(swap);
                const result = filter ? filter(swap) : swap;
                onMessage(result);
            }
        });

        this.contract['Withdraw']().watch(function(err: any, withdraw: any) {
            if (err) {
                // TODO: Handle errors
            }

            if (withdraw) {
                TransformWithdraw(withdraw);
                const result = filter ? filter(withdraw) : withdraw;
                onMessage(result);
            }
        });

        this.contract['Refund']().watch(function(err: any, refund: any) {
            if (err) {
                // TODO: Handle errors
            }

            if (refund) {
                TransformRefund(refund);
                const result = filter ? filter(refund) : refund;
                onMessage(result);
            }
        });
    }
}
