export default (expiration = 10800) => {
    return {
        network: 'ONE',
        explorer: '',
        providerUrl: '',
        contractAddress: '0x1F95205e433b1701D6c74A73E3940D8f55Df2Bb2',
        originBlock: '',
        receiverAddress: '',
        blockTime: 0,
        expiration,
        decimals: 18,
        unix: true,
    };
};
