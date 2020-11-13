import HttpClient from './HttpClient';

export default class AlgorandProvider {
    private httpClient: HttpClient;

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL);
    }

    async getCurrentBlock() {
        return await this.httpClient.get(`/block/tip`);
    }

    async getTransaction(txHash: string) {
        return await this.httpClient.get(`/tx/${txHash}`);
    }

    async getTransactionParams() {
        return await this.httpClient.get(`/tx/params`);
    }

    async getFee() {
        return await this.httpClient.get('/block/fee');
    }

    async getBlockTime() {
        const result = await this.httpClient.get('/block/time');
        return result.time || 4;
    }

    async getBalance(address: string) {
        return await this.httpClient.get('tx/balance/' + address);
    }

    async sendRawTransaction(rawTx: any, metadata: any) {
        return await this.httpClient.post('/tx/send', { rawTx, metadata });
    }
}
