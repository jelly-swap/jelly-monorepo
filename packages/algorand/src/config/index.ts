export default (expiration = 10800) => {
    return {
        network: 'ALGO',
        explorer: 'https://algoexplorer.io/',
        providerUrl: 'https://mainnet-algorand.api.purestake.io/ps2',
        receiverAddress: '',
        expiration,
        decimals: 6,
        unix: true,
        apiKey: 'YOUR_API_KEY',
        baseServer: 'https://mainnet-algorand.api.purestake.io/ps2',
        apiProviderUrl: 'https://spacejelly.network/algo/api/v1/algo',
        blockTimeSeconds: 4,
        maxFee: 2000,
        zeroAddress: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    };
};
