export default (expiration = 10800) => {
    return {
        network: 'AE',
        explorer: 'https://testnet.explorer.aepps.com/transactions/',
        providerUrl: 'https://sdk-testnet.aepps.com/',
        internalUrl: 'https://sdk-testnet.aepps.com/',
        compilerUrl: 'https://compiler.aepps.com',
        contractAddress: 'ct_2M9XPMwz1GggFRPatEd2aAPZbig32ZqRJBnhTT2yRVM4k6CQnb',
        receiverAddress: 'ak_2ifr2XxhrMskWdnXZqJE2mVhhwhXYvQD6nRGYLMR5mTSHW4RZz',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: false,
        apiUrl: 'https://testnet.aeternal.io/',
    };
};
