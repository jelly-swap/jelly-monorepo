export default (expiration = 10800) => {
    return {
        network: 'ALGO',
        explorer: 'https://algoexplorer.io/',
        providerUrl: 'https://spacejelly.network/algo/api/v1/algo',
        receiverAddress: '',
        expiration,
        decimals: 6,
        unix: true,
        apiKey: 'YOUR_API_KEY',
        baseServer: 'https://spacejelly.network/algo/api/v1/algo',
        apiProviderUrl: 'https://spacejelly.network/algo/api/v1/algo',
        blockTimeSeconds: 4,
        maxFee: 2000,
        zeroAddress: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    };
};
