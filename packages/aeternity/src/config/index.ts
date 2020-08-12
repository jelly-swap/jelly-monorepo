export default (expiration = 10800) => {
    return {
        network: 'AE',
        explorer: 'https://testnet.explorer.aepps.com/transactions/',
        providerUrl: 'https://testnet.aeternity.io/',
        internalUrl: 'https://testnet.aeternity.io/',
        compilerUrl: 'https://latest.compiler.aepps.com',
        nodeName: 'testnet',
        wsUrl: 'wss://testnet.aeternal.io/websocket',
        contractAddress: 'ct_27JLKSzWS1ZV8Kzu6FyDpmC16xAAAJqwPtVv3dECmswR2zdeFN',
        receiverAddress: 'ak_471dYUrQ8EAtmzwuKDw4VBGQdnEcP5YF563WG4yR9Wvfp5tRp',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: false,
        apiUrl: 'https://testnet.aeternal.io/',
    };
};
