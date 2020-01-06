export default class WithdrawEvent {
    private provider: any;
    private lastBlock: number;

    constructor(provider: any) {
        this.provider = provider;
        this.lastBlock = 0;
    }

    async subscribe(onMessage: Function, filter: Function) {
        this.lastBlock = Number(await this.provider.lastBlock());
        const { type, address } = filter();

        if (type !== 'getWithdrawByReceiverAndBlock' && type !== 'getWithdrawBySenderAndBlock') {
            throw new Error('Type must be either `getWithdrawByReceiverAndBlock` or `getWithdrawBySenderAndBlock`');
        }

        // type can be:
        // getWithdrawByReceiverAndBlock
        // getWithdrawBySenderAndBlock
        setInterval(this._subscribe.bind(this, onMessage, type, address), 20 * 1000);
    }

    async _subscribe(onMessage: Function, type: string, address: string) {
        const lastBlock = Number(await this.provider.lastBlock());

        if (this.lastBlock !== lastBlock) {
            const withdraws = await this.provider[type](address, lastBlock);

            if (withdraws.length > 0) {
                withdraws.map((withdraw: any) => onMessage(withdraw));
            }

            this.lastBlock = lastBlock;
        }
    }

    async getPast(filter: Function) {
        const { type, address } = filter();

        if (type !== 'getWithdrawByReceiver' && type !== 'getWithdrawBySender') {
            throw new Error('Type must be either `getWithdrawByReceiver` or `getWithdrawBySender`');
        }

        // type can be:
        // getWithdrawByReceiver
        // getWithdrawBySender
        const withdraws = await this.provider[type](address);
        return withdraws;
    }
}
