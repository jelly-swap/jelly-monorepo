export default (expiration = 10800) => {
    return {
        network: 'TRX',
        explorer: 'https://shasta.tronscan.org/#/transaction/',
        providerUrl: 'https://api.shasta.trongrid.io/',
        contractAddress: 'TPASPFmeWcPcF5CR668P5dgrzK99ELb3pV',
        receiverAddress: '4192cf62d8c6dd4ebbd9547f41822591a10d21dcf5',
        blockTime: 3,
        expiration,
        decimals: 6,
        unix: true,
    };
};
