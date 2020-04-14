export default class NewContractEvent {
    public lastBlock: number;
    private provider: any;

    constructor(provider: any) {
        this.provider = provider;
        this.lastBlock = 0;
    }

    async subscribe(onMessage: Function, filter: any, lastBlock: number) {
        const { type, address } = filter;

        if (type !== 'getSwapsByAddressAndBlock' && type !== 'getSwapsByReceiverAndBlock') {
            throw new Error('Type must be either `getSwapsByAddressAndBlock` or `getSwapsByReceiverAndBlock`');
        }

        if (this.lastBlock !== lastBlock) {
            const swaps = await this.provider[type](address, lastBlock);

            if (swaps.length > 0) {
                swaps.map((swap: any) => {
                    if (swap.blockHeight !== -1) {
                        if (compareAddress(swap.sender, address)) {
                            onMessage({ ...swap, eventName: 'NEW_CONTRACT', isSender: true });
                        } else {
                            onMessage({ ...swap, eventName: 'NEW_CONTRACT' });
                        }
                    }
                });
            }

            this.lastBlock = lastBlock;
        }
    }

    async getPast(filter: any) {
        const { type, address, startBlock, endBlock } = filter;

        if (type !== 'getExpiredSwaps' && type !== 'getSwapsByAddress' && type !== 'getSwapsByReceiver') {
            throw new Error('Type must be either `getExpiredSwaps` or `getSwapsByAddress` or `getSwapsByReceiver`');
        }

        const swaps = await this.provider[type](address, startBlock, endBlock);

        if (swaps.length > 0) {
            return swaps.reduce((result: any[], event: any) => {
                if (event.blockHeight !== -1) {
                    if (compareAddress(event.sender, address)) {
                        result.push({ ...event, isSender: true });
                    } else {
                        result.push(event);
                    }
                }

                return result;
            }, []);
        }
    }
}

const compareAddress = (a1: string, a2: string) => {
    return a1.toLowerCase() === a2.toLowerCase();
};
