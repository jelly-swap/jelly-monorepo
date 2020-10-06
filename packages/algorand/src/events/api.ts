import { indexerClient, algodClient } from '../config';

export default class ApiProvider {
    async lastBlock() {
        const statusInfo = await algodClient.status().do();

        return statusInfo['last-round'];
    }

    async getSwapsByAddress(address: string) {
        return await indexerClient.lookupAccountTransactions(address).do();
    }

    async getSwapsByReceiver(receiver: string) {
        return await indexerClient.lookupAccountTransactions(receiver).do();
    }
}
