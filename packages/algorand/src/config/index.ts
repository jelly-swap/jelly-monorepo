export default (expiration = 10800) => {
    return {
        network: 'ALGO',
        explorer: 'https://testnet.algoexplorer.io/',
        providerUrl: 'https://testnet-algorand.api.purestake.io/ps2',
        receiverAddress: 'NIESDL437QEKQTAPN7YMIYSK2VBISDENSWVATQCYMLT2FCCYBFJ2DFHUPA',
        expiration,
        decimals: 6,
        unix: true,
        apiKey: 'vMRVuy8jHPawChzNOx4mM8Btl5SghQ4N710gtACD',
        baseServer: 'https://testnet-algorand.api.purestake.io/ps2',
    };
};
