export default class WithdrawEvent {
    public lastBlock: number;
    private provider: any;

    constructor(provider: any) {
        this.provider = provider;
        this.lastBlock = 0;
    }

    async subscribe(onMessage: Function, filter: any, lastBlock: number) {
        const { type, address } = filter;

        if (type !== 'getWithdrawByReceiverAndBlock' && type !== 'getWithdrawBySenderAndBlock') {
            throw new Error('Type must be either `getWithdrawByReceiverAndBlock` or `getWithdrawBySenderAndBlock`');
        }

        if (this.lastBlock !== lastBlock) {
            const withdraws = await this.provider[type](address, lastBlock);

            if (withdraws.length > 0) {
                withdraws.map((withdraw: any) => onMessage({ ...withdraw, eventName: 'WITHDRAW' }));
            }

            this.lastBlock = lastBlock;
        }
    }

    async getPast(filter: any) {
        const { type, address } = filter;
        if (type !== 'getWithdrawByReceiver' && type !== 'getWithdrawBySender') {
            throw new Error('Type must be either `getWithdrawByReceiver` or `getWithdrawBySender`');
        }

        return await this.provider[type](address);
    }
}
