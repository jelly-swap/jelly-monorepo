import BigNumber from 'bignumber.js';
import memoize from 'memoizee';

import HttpClient from './HttpClient';

import CacheConfig from './CacheConfig';

export default class BitcoinProvider {
    private httpClient: HttpClient;
    private getUnspentTransactionsCache: Function;
    private getCurrentBlockCache: Function;

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL);

        this.getUnspentTransactionsCache = memoize(this._getUnspentTransactions, CacheConfig());
        this.getCurrentBlockCache = memoize(this._getCurrentBlock, CacheConfig());
    }

    async getCurrentBlock(cache = false) {
        if (cache) {
            return await this.getCurrentBlockCache();
        }

        return await this._getCurrentBlock();
    }

    async _getCurrentBlock() {
        const response = await this.httpClient.get(`/block/tip`);
        return response.height;
    }

    async getRawTransaction(txHash: string) {
        return await this.httpClient.getExternal(`https://blockstream.info/api/tx/${txHash}/hex`);
    }

    async getTransaction(txHash: string) {
        return await this.httpClient.get(`/tx/${txHash}`);
    }

    async getFeePerByte(numberOfBlocks = 6) {
        const result = await this.httpClient.get(`/block/fee/${numberOfBlocks}`);
        return result;
    }

    async getUnspentTransactions(addresses: any, cache = false) {
        if (cache) {
            return await this.getUnspentTransactionsCache(addresses);
        }

        return await this._getUnspentTransactions(addresses);
    }

    async getBalance(addresses: any) {
        const utxos = await this.getUnspentTransactions(addresses, true);

        const balance = utxos
            .reduce((prev: BigNumber, curr: any) => {
                return prev.plus(new BigNumber(curr.value));
            }, new BigNumber(0))
            .toNumber();

        return balance;
    }

    // TODO: find a way to improve the logic
    async _getUnspentTransactions(addresses: any) {
        const currentHeight = await this.getCurrentBlock();

        const queries = [];
        let addressQuery = '';

        // Make request with 50 addresses each.
        for (let i = 0; i < addresses.length; i++) {
            addressQuery = `${addressQuery};${addresses[i].address}`;
            if (i > 0 && i % 50 === 0) {
                queries.push(addressQuery.slice(1, addressQuery.length));
                addressQuery = '';
            }
        }

        queries.push(addressQuery.slice(1, addressQuery.length));

        const utxoSets: any[] = await Promise.all(
            queries.map((addrs) => this.httpClient.get(`/address/unspent/${addrs}/${currentHeight}`))
        );

        const utxos = [].concat.apply([], utxoSets);
        return utxos;
    }

    async sendRawTransaction(rawTx: any, metadata: any) {
        return await this.httpClient.post('/tx/send', { rawTx, metadata });
    }
}
