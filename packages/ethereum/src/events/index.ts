import { utils } from 'ethers';
import { Log } from 'ethers/providers';

import TransformNewContract from './newContract';
import TransformWithdraw from './withdraw';
import TransformRefund from './refund';

import Config from '../config';
import ABI from '../config/abi';
import EthereumContract from '../contract';

export default class Event {
    private contract: EthereumContract;
    private interface: utils.Interface;

    constructor(contract: EthereumContract) {
        this.contract = contract;
        this.interface = new utils.Interface(ABI);
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
            }
        }
    }

    async _getPast(eventName: string, transform: Function, filter?: Function, currentBlock?: string | number) {
        if (!currentBlock) {
            currentBlock = await this.contract.provider.getBlockNumber();
        }

        const eventFilter = {
            address: Config().contractAddress,
            fromBlock: Number(currentBlock) - 15000, // TODO: constants
            toBlock: currentBlock,
            topics: [this.interface.events[eventName].topic],
        };

        const logs = await this.contract.provider.getLogs(eventFilter);

        const result = logs.reduce<Log[]>((result: Log[], log: Log): Log[] => {
            const event = this.interface.parseLog(log);
            const t = transform(event.values, log.transactionHash);
            const f = filter ? filter(t) : t;

            if (f) {
                result.push(f);
            }

            return result;
        }, []);

        return result;
    }

    async subscribe(onMessage: Function, filter?: Function) {
        this.contract.contract.on('NewContract', (...args: []) => {
            const swap = TransformNewContract(args);
            const result = filter ? filter(swap) : swap;
            onMessage(result);
        });

        this.contract.contract.on('Withdraw', (...args: []) => {
            const withdraw = TransformWithdraw(args);
            const result = filter ? filter(withdraw) : withdraw;
            onMessage(result);
        });

        this.contract.contract.on('Refund', (...args: []) => {
            const refund = TransformRefund(args);
            const result = filter ? filter(refund) : refund;
            onMessage(result);
        });
    }
}
