export default (expiration = 10800) => {
    return {
        network: 'AVA',
        explorer: 'https://blockscout.avax.network/tx/',
        providerUrl: 'https://testapi.avax.network/ext/bc/C/rpc',
        contractAddress: '0xFD2Be41a8b06CEd4fDbB4DAB64047ffCc389Dff6',
        originBlock: '3137',
        receiverAddress: '',
        blockTime: 0,
        expiration,
        decimals: 18,
        unix: true,
        chainId: 43110,
    };
};
