import memoize from 'memoizee';

import HttpClient from './HttpClient';

import CacheConfig from './CacheConfig';

export default class AlgorandProvider {
    private httpClient: HttpClient;
    private getCurrentBlockCache: Function;

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL);
        this.getCurrentBlockCache = memoize(this._getCurrentBlock, CacheConfig());
    }

    async getCurrentBlock(cache = false) {
        if (cache) {
            return await this.getCurrentBlockCache();
        }

        return await this._getCurrentBlock();
    }

    async _getCurrentBlock() {
        return await this.httpClient.get(`/block/tip`);
    }

    async getTransaction(txHash: string) {
        return await this.httpClient.get(`/tx/${txHash}`);
    }

    async getTransactionParams() {
        return await this.httpClient.get(`/tx/params`);
    }

    async getFee() {
        return await this.httpClient.get('/block/fee/');
    }

    async getBalance(address: string) {
        return await this.httpClient.get('tx/balance/' + address);
    }

    async sendRawTransaction(rawTx: any, metadata: any) {
        return await this.httpClient.post('/tx/send', { rawTx, metadata });
    }
}
