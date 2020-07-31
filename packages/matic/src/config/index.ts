export default (expiration = 10800) => {
    return {
        network: 'Matic',
        explorer: 'https://mumbai-explorer.matic.today/tx/',
        providerUrl: 'https://rpc-mumbai.matic.today',
        contractAddress: '0x68F585119dCF5E7E150e412BC9860536DD8dCEDD',
        originBlock: '2355902',
        receiverAddress: '',
        blockTime: 0,
        expiration,
        decimals: 18,
        unix: true,
        chainId: 80001,
    };
};
