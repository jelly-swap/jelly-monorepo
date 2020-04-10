import BigNumber from 'bignumber.js';

import HttpClient from './HttpClient';

export default class BitcoinProvider {
    private httpClient: HttpClient;

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL);
    }

    async getBlockHeight() {
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

    // TODO: find a way to improve the logic
    async getUnspentTransactions(addresses: any) {
        const currentHeight = await this.getBlockHeight();

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
