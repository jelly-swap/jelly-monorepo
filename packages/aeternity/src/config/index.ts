export default (expiration = 10800) => {
    return {
        network: 'AE',
        explorer: 'https://testnet.explorer.aepps.com/transactions/',
        providerUrl: 'https://testnet.aeternity.io/',
        internalUrl: 'https://testnet.aeternity.io/',
        compilerUrl: 'https://latest.compiler.aepps.com',
        wsUrl: 'wss://testnet.aeternal.io/websocket',
        contractAddress: 'ct_2f7rhRtba2G3SG6yrQoerJsT53XDbv9iNqY1m1MmxWWnuwbjvh',
        receiverAddress: 'ak_471dYUrQ8EAtmzwuKDw4VBGQdnEcP5YF563WG4yR9Wvfp5tRp',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: false,
        apiUrl: 'https://testnet.aeternal.io/',
    };
};
