import { HttpClient } from '@jelly-swap/btc-provider';

export default class ApiProvider {
    private client: HttpClient;

    constructor(url: string) {
        this.client = new HttpClient(url);
    }

    async lastBlock() {
        return await this.client.get('/lastBlock');
    }

    async getSwapsByAddress(address: string) {
        return await this.client.get(`/swap/address/${address}`);
    }

    async getSwapsByReceiver(receiver: string) {
        return await this.client.get(`/swap/receiver/${receiver}`);
    }

    async getSwapsByAddressAndBlock(address: string, block: string) {
        return await this.client.get(`/swap/address/${address}/block/${block}`);
    }

    async getSwapsByReceiverAndBlock(address: string, block: string) {
        return await this.client.get(`/swap/receiver/${address}/block/${block}`);
    }

    async getWithdrawByReceiver(address: string) {
        return await this.client.get(`/withdraw/receiver/${address}`);
    }

    async getWithdrawBySender(address: string) {
        return await this.client.get(`/withdraw/sender/${address}`);
    }

    async getWithdrawByReceiverAndBlock(address: string, block: string) {
        return await this.client.get(`/withdraw/receiver/${address}/block/${block}`);
    }

    async getWithdrawBySenderAndBlock(address: string, block: string) {
        return await this.client.get(`/withdraw/sender/${address}/block/${block}`);
    }

    async getExpiredSwaps(sender: string, startBlock: string, endBlock: string) {
        const result = await this.client.get(
            `swap/sender/${sender}/status/4/startBlock/${startBlock}/endBlock/${endBlock}`
        );
        return result;
    }

    async getStatus(ids: string[]) {
        return await this.client.post('/swap/status', { ids });
    }
}
