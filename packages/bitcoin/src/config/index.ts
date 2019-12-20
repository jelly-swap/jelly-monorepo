export default (expiration = 10800) => {
    return {
        network: 'BTC',
        explorer: '',
        providerUrl: '',
        contractAddress: '',
        receiverAddress: '',
        expiration,
        decimals: 8,
        unix: true,
    };
};
