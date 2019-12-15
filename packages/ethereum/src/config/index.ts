export default (expiration = 10800) => {
    return {
        network: 'ETH',
        explorer: 'https://ropsten.etherscan.io/tx/',
        providerUrl: 'https://ropsten.infura.io/v3/8fe4fc9626494d238879981936dbf144',
        contractAddress: '0xc961b206901a821affddd77fac831e9ff1be89c0',
        receiverAddress: '0xF684C21Ec023E93da0B402ac0a274317eb51C2c7',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: true,
    };
};
