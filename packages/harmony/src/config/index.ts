export default (expiration = 10800) => {
    return {
        network: 'ONE',
        explorer: 'https://explorer.testnet.harmony.one/#/tx/',
        providerUrl: 'https://api.s0.b.hmny.io',
        contractAddress: '0x1F95205e433b1701D6c74A73E3940D8f55Df2Bb2',
        originBlock: '558124',
        receiverAddress: '',
        blockTime: 0,
        expiration,
        decimals: 18,
        unix: true,
        chainId: 2,
    };
};
