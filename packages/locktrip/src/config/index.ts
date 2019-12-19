export default (expiration = 10800) => {
    return {
        network: 'LOC',
        explorer: '',
        providerUrl: '',
        contractAddress: '',
        receiverAddress: '',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: true,
    };
};
