import { filter } from '@jelly-swap/utils';
import { SwapEvent, WithdrawEvent, RefundEvent } from '@jelly-swap/types';

import { utils } from 'ethers';
import { Log } from 'ethers/providers';

import EthereumContract from '../contract';

import Config from '../config';
import ABI from '../config/abi';

export default class Event {
    private config: any;
    private contract: EthereumContract;
    private interface: utils.Interface;

    constructor(contract: EthereumContract, config = Config()) {
        this.config = config;
        this.contract = contract;
        this.interface = new utils.Interface(ABI);
    }

    async getPast(
        type: string,
        filterObject?: any,
        fromBlock?: string | number,
        toBlock?: string | number
    ): Promise<any> {
        const { swaps, refunds, withdraws } = await this._getPast(filterObject, fromBlock, toBlock);

        switch (type) {
            case 'new': {
                return await this.getSwapsWithStatus(swaps, filterObject);
            }

            case 'withdraw': {
                return withdraws;
            }

            case 'refund': {
                return refunds;
            }

            case 'all': {
                return {
                    swaps: await this.getSwapsWithStatus(swaps, filterObject),
                    refunds,
                    withdraws,
                } as any;
            }

            default: {
                throw new Error(`Ivalind event type. Available event types: 'new', 'withdraw', 'refund', 'all'`);
            }
        }
    }

    async getSwapsWithStatus(swaps: SwapEvent[], filter: any) {
        const ids = swaps.map((s: any) => s.id);

        const status = await this.contract.getStatus(ids);

        return swaps.map((s: any, index: number) => {
            if (filter?.new?.sender?.toLowerCase() === s.sender.toLowerCase()) {
                return { ...s, status: Number(status[index].toString()), isSender: true };
            }
            return { ...s, status: Number(status[index].toString()) };
        });
    }

    async _getPast(filters?: any, fromBlock?: string | number, toBlock?: string | number) {
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
                    const swap = {
                        network: 'ETH',
                        eventName: 'NEW_CONTRACT',
                        id: parsed.values.id,
                        hashLock: parsed.values.hashLock,
                        sender: parsed.values.sender,
                        receiver: parsed.values.receiver,
                        inputAmount: parsed.values.inputAmount.toString(),
                        outputAmount: parsed.values.outputAmount.toString(),
                        expiration: parsed.values.expiration.toString(),
                        outputNetwork: parsed.values.outputNetwork,
                        outputAddress: parsed.values.outputAddress,
                        transactionHash: log.transactionHash,
                    };

                    if (filters.new) {
                        if (filter(filters.new, swap)) {
                            swaps.push(swap);
                        }
                    } else {
                        swaps.push(swap);
                    }

                    break;
                }

                case 'Withdraw': {
                    const withdraw = {
                        network: 'ETH',
                        eventName: 'WITHDRAW',
                        id: parsed.values.id,
                        secret: parsed.values.secret,
                        hashLock: parsed.values.hashLock,
                        sender: parsed.values.sender,
                        receiver: parsed.values.receiver,
                        transactionHash: log.transactionHash,
                    };

                    if (filters.withdraw) {
                        if (filter(filters.withdraw, withdraw)) {
                            withdraws.push(withdraw);
                        }
                    } else {
                        withdraws.push(withdraw);
                    }

                    break;
                }

                case 'Refund': {
                    const refund = {
                        network: 'ETH',
                        eventName: 'REFUND',
                        id: parsed.values.id,
                        hashLock: parsed.values.hashLock,
                        sender: parsed.values.sender,
                        receiver: parsed.values.receiver,
                        transactionHash: log.transactionHash,
                    };

                    if (filters.refund) {
                        if (filter(filters.refund, refund)) {
                            refunds.push(refund);
                        }
                    } else {
                        refunds.push(refund);
                    }

                    break;
                }
            }
        });

        return { swaps, withdraws, refunds };
    }

    async subscribe(onMessage: Function, filters?: any) {
        this.contract.contract.on(
            {
                address: this.config.contractAddress,
            },
            log => {
                const parsed = this.interface.parseLog(log);

                switch (parsed.name) {
                    case 'NewContract': {
                        const swap = {
                            network: 'ETH',
                            eventName: 'NEW_CONTRACT',
                            id: parsed.values.id,
                            hashLock: parsed.values.hashLock,
                            sender: parsed.values.sender,
                            receiver: parsed.values.receiver,
                            inputAmount: parsed.values.inputAmount.toString(),
                            outputAmount: parsed.values.outputAmount.toString(),
                            expiration: parsed.values.expiration.toString(),
                            outputNetwork: parsed.values.outputNetwork,
                            outputAddress: parsed.values.outputAddress,
                            transactionHash: log.transactionHash,
                        };

                        if (filters.new) {
                            if (filter(filters.new, swap)) {
                                if (filters.new.sender?.toLowerCase() === swap.sender.toLowerCase()) {
                                    onMessage({ ...swap, isSender: true });
                                } else {
                                    onMessage(swap);
                                }
                            }
                        } else {
                            onMessage(swap);
                        }

                        break;
                    }

                    case 'Withdraw': {
                        const withdraw = {
                            network: 'ETH',
                            eventName: 'WITHDRAW',
                            id: parsed.values.id,
                            secret: parsed.values.secret,
                            hashLock: parsed.values.hashLock,
                            sender: parsed.values.sender,
                            receiver: parsed.values.receiver,
                            transactionHash: log.transactionHash,
                        };

                        if (filters.withdraw) {
                            if (filter(filters.withdraw, withdraw)) {
                                onMessage(withdraw);
                            }
                        } else {
                            onMessage(withdraw);
                        }

                        break;
                    }

                    case 'Refund': {
                        const refund = {
                            network: 'ETH',
                            eventName: 'REFUND',
                            id: parsed.values.id,
                            hashLock: parsed.values.hashLock,
                            sender: parsed.values.sender,
                            receiver: parsed.values.receiver,
                            transactionHash: log.transactionHash,
                        };

                        if (filters.refund) {
                            if (filter(filters.refund, refund)) {
                                onMessage(refund);
                            }
                        } else {
                            onMessage(refund);
                        }

                        break;
                    }
                }
            }
        );
    }
}
