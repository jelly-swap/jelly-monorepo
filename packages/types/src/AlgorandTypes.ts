export interface AlgorandProvider {
    getCurrentBlock(cache?: boolean): Promise<any>;
    getRawTransaction(txHash: string): Promise<any>;
    getTransaction(txHash: string): Promise<any>;
    getFee(numberOfBlocks?: number): Promise<any>;
    getBalance(addresses: any): Promise<any>;
    sendRawTransaction(rawTx: any, metadata: any): Promise<any>;
    getTransactionParams(): Promise<any>;
}

export interface AlgorandWallet {
    provider: AlgorandProvider;
    address: string;
    privateKey: string;
}
