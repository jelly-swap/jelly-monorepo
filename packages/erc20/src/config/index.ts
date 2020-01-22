import { TokenConfig, AddressToToken } from './tokens';

export default (token?: string, tokenConfig = TokenConfig, addressToToken = AddressToToken, expiration = 10800) => {
    return {
        explorer: 'https://ropsten.etherscan.io/tx/',
        providerUrl: 'https://ropsten.infura.io/v3/8fe4fc9626494d238879981936dbf144',
        contractAddress: '0x66ea49fd943544d59e14d1bd9107217c7503906a',
        receiverAddress: '0xc555d8bc1B47F53F2b28fd2B3301aD94F7add17C',
        blockTime: 15,
        expiration, // 3 hours,
        unix: true,
        AddressToToken: addressToToken,
        TokenToAddress: (token: string) => {
            return tokenConfig[token].address;
        },
        ...tokenConfig[token],
    };
};
