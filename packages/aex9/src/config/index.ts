import { TokenConfig, AddressToToken } from './tokens';

export default (token?: string, tokenConfig = TokenConfig, addressToToken = AddressToToken, expiration = 10800) => {
    return {
        explorer: 'https://testnet.explorer.aepps.com/transactions/',
        providerUrl: 'https://testnet.aeternity.io/',
        internalUrl: 'https://testnet.aeternity.io/',
        compilerUrl: 'https://compiler.aepps.com',
        wsUrl: 'wss://testnet.aeternal.io/websocket',
        contractAddress: 'ct_2mqPbYC2nYMMYWnbufJTV2RVcgg8V4rf1XDAhu1APrw9PgQ4V',
        receiverAddress: 'ak_2ifr2XxhrMskWdnXZqJE2mVhhwhXYvQD6nRGYLMR5mTSHW4RZz',
        blockTime: 5,
        expiration,
        unix: false,
        apiUrl: 'https://testnet.aeternal.io/',

        AddressToToken: addressToToken,
        TokenToAddress: (token?: string) => {
            return tokenConfig[token].address;
        },
        ...tokenConfig[token],
    };
};
