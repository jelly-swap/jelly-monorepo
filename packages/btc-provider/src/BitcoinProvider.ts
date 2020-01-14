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

    async getBlockTxs(blockHash: string) {
        return await this.httpClient.get(`/tx?blockHash=${blockHash}`);
    }

    async getTransaction(txHash: string) {
        const tx = await this.httpClient.get(`/tx/${txHash}`);
        const coins = await this.getCoins(txHash);
        return { ...tx, ...coins };
    }

    async getCoins(txHash: string) {
        const response = await this.httpClient.get(`/tx/${txHash}/coins`);
        return response;
    }

    async getBlockTransactions(blockHash: string) {
        const blockTxs = await this.getBlockTxs(blockHash);

        const transactions = [];
        for (const tx of blockTxs) {
            const transaction = await this.getTransaction(tx.txid);
            const coins = await this.getCoins(tx.txid);
            transactions.push({ ...transaction, ...coins });
        }

        return transactions;
    }

    async getFeePerByte(numberOfBlocks = 6) {
        const result = await this.httpClient.get(`/fee/${numberOfBlocks}`);
        return Math.ceil(((Math.pow(10, 8) * result.feerate) / 1024) * 5);
    }

    async isAddressUsed(address: string) {
        const txs = await this.getAddressTransactions(address);
        return txs.length > 0;
    }

    async getAddressTransactions(address: string) {
        return await this.httpClient.get(`address/${address}/txs`);
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
            queries.map(addrs => this._getUnspentTransactions(addrs, currentHeight))
        );

        const utxos = [].concat.apply([], utxoSets);
        return utxos;
    }

    async _getUnspentTransactions(addresses: string, currentHeight: number, limit = 1000) {
        const response = await this.httpClient.get(`/address/${addresses}/?unspent=true&limit=${limit}`);

        return response
            .filter((utxo: any) => {
                return utxo.mintHeight > -3 && utxo.spentTxid === '';
            })
            .map((utxo: any) => ({
                ...utxo,
                satoshis: utxo.value,
                amount: new BigNumber(utxo.value).dividedBy('100000000').toNumber(),
                confirmations: currentHeight - utxo.mintHeight,
            }));
    }

    async sendRawTransaction(rawTransaction: any) {
        return await this.httpClient.post('/tx/send', { rawTx: rawTransaction });
    }
}
