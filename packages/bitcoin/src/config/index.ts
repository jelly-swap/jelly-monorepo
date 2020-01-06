export default (expiration = 10800) => {
    return {
        network: 'BTC',
        explorer: 'https://blockstream.info/testnet/tx/',
        providerUrl: 'https://spacejelly.network/bitpay/api/BTC/testnet',
        receiverAddress: 'tb1qc4mwllgvmy0xqsdexpm5v8g74ldmv698whnyrw',
        expiration,
        decimals: 8,
        unix: true,
        apiProviderUrl: 'https://spacejelly.network/btc/api/v1/btc',
    };
};
