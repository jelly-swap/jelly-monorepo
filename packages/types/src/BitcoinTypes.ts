export interface BitcoinAddress {
    address: string;
    derivationPath: string;
    publicKey: Buffer;
    index: number;
    change: boolean;

    toString(): string;

    valueOf(): string;

    equals(address: string): boolean;
}

export type UnusedAddress = {
    change: BitcoinAddress;
    nonChange: BitcoinAddress;
};

export type UsedUnusedAddressesType = {
    usedAddresses: BitcoinAddress[];
    unusedAddress: UnusedAddress;
};

export interface BitcoinWallet {
    getCurrentBlock(): Promise<number>;
    getBalance(numAddressPerCall: number): Promise<number>;

    getAddress(index: number, change: boolean): Promise<string>;
    getAddresses(startingIndex: number, numAddresses: number, change: boolean): Promise<BitcoinAddress[]>;
    getAddressList(numAddressPerCall: number): Promise<BitcoinAddress[]>;

    getWalletAddress(address: string, maxAddresses: number, addressesPerCall: number): Promise<BitcoinAddress>;

    getChangeAddresses(startingIndex: number, numAddresses: number): Promise<BitcoinAddress[]>;
    getNonChangeAddresses(startingIndex: number, numAddresses: number): Promise<BitcoinAddress[]>;

    getUnusedChangeAddress(numAddressPerCall: number): Promise<BitcoinAddress>;
    getUnusedNonChangeAddress(numAddressPerCall: number): Promise<BitcoinAddress>;

    getUsedAddresses(numAddressPerCall: number): Promise<BitcoinAddress[]>;
    getUnusedAddress(change: boolean, numAddressPerCall: number): Promise<BitcoinAddress>;

    getUsedUnusedAddresses(numAddressPerCall: number): Promise<UsedUnusedAddressesType>;

    buildTransaction(to: string, value: number, data: any, feePerByte?: number): Promise<string>;

    sendTransaction(to: string, value: number, data: any, feePerByte?: number): Promise<string>;

    signP2SHTransaction(
        tx: any,
        rawTx: any,
        address: any,
        vout: any,
        outputScript: any,
        segwit: boolean,
        expiration: number
    ): Promise<Buffer>;
}
