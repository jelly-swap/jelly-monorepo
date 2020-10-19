const algosdk = require('algosdk');
export default class HttpClient {
    algodClient: any;

    constructor(apiKey: any, baseServer: string, port: any = '') {
        this.algodClient = new algosdk.Algodv2(apiKey, baseServer, port);
    }

    async getCurrentBlock(): Promise<string | number> {
        try {
            const params = await this.algodClient.getTransactionParams().do();
            return params.firstRound;
        } catch (err) {
            return err;
        }
    }

    async getBalance(_address: string): Promise<string | number> {
        try {
            const balance = await this.algodClient.accountInformation(_address).do();
            return balance.amount;
        } catch (err) {
            return err;
        }
    }

    async getTransactionParams(): Promise<any> {
        try {
            return await this.algodClient.getTransactionParams().do();
        } catch (err) {
            return err;
        }
    }

    async sendRawTransaction(tx: any): Promise<any> {
        return await this.algodClient.sendRawTransaction(tx).do();
    }
}