export default (expiration = 10800) => {
    return {
        network: 'ALGO',
        explorer: 'https://algoexplorer.io/',
        providerUrl: 'https://spacejelly.network/algo/api/v1/algo',
        receiverAddress: '',
        expiration,
        decimals: 6,
        blockTimeSeconds: 4,
        maxFee: 2000,
        zeroAddress: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    };
};
