export type Network = {
    name: string;
    coinType: string;
    isTestnet: boolean;
    messagePrefix: string;
    bech32: string;
    bip32: bip32;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};

type bip32 = {
    public: number;
    private: number;
};
