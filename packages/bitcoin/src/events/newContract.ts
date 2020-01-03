export default class NewContractEvent {
    private provider: any;
    private lastBlock: number;

    constructor(provider: any) {
        this.provider = provider;
        this.lastBlock = 0;
    }

    async subscribe(onMessage: Function, filter: Function) {
        this.lastBlock = Number(await this.provider.lastBlock());
        const { type, address } = filter();

        if (type !== 'getSwapsByAddressAndBlock' && type !== 'getSwapsByReceiverAndBlock') {
            throw new Error('Type must be either `getSwapsByAddressAndBlock` or `getSwapsByReceiverAndBlock`');
        }

        // type can be:
        // getSwapsByAddressAndBlock
        // getSwapsByReceiverAndBlock
        setInterval(this._subscribe.bind(this, onMessage, type, address), 20 * 1000);
    }

    async _subscribe(onMessage: Function, type: string, address: string) {
        const lastBlock = Number(await this.provider.lastBlock());

        if (this.lastBlock !== lastBlock) {
            const swaps = await this.provider[type](address, lastBlock);
            if (swaps.length > 0) {
                swaps.map((swap: any) => onMessage(swap));
            }

            this.lastBlock = lastBlock;
        }
    }

    async getPast(filter: Function) {
        const { type, address, startBlock, endBlock } = filter();

        if (type !== 'getExpiredSwaps' && type !== 'getSwapsByAddress' && type !== 'getSwapsByReceiver') {
            throw new Error('Type must be either `getExpiredSwaps` or `getSwapsByAddress` or `getSwapsByReceiver`');
        }

        // type can be:
        // getExpiredSwaps
        // getSwapsByAddress
        const swaps = await this.provider[type](address, startBlock, endBlock);

        return swaps;
    }
}
