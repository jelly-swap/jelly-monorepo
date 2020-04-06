export default (expiration = 10800) => {
    return {
        network: 'ETH',
        explorer: 'https://ropsten.etherscan.io/tx/',
        providerUrl: 'https://ropsten.infura.io/v3/8fe4fc9626494d238879981936dbf144',
        contractAddress: '0x2c7d163af0ab8d4a592913e1a599c35ebb7051c5',
        originBlock: 7487753,
        receiverAddress: '0xF684C21Ec023E93da0B402ac0a274317eb51C2c7',
        blockTime: 15,
        expiration,
        decimals: 18,
        unix: true,
        pollingInterval: 15000,
        cacheAge: 15000,
        gasMultiplier: 2,
    };
};
