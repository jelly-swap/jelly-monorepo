import { TokenConfig, AddressToToken } from './tokens';

export default (token?: string, tokenConfig = TokenConfig, addressToToken = AddressToToken, expiration = 10800) => {
    return {
        explorer: 'https://ropsten.etherscan.io/tx/',
        providerUrl: 'https://ropsten.infura.io/v3/8fe4fc9626494d238879981936dbf144',
        contractAddress: '0x146ba82F8bFedbef77F52E45D3868c914bB4EF46',
        receiverAddress: '0xc555d8bc1B47F53F2b28fd2B3301aD94F7add17C',
        blockTime: 15,
        expiration,
        unix: true,
        cacheAge: 15000,
        pollingInterval: 15000,
        originBlock: 7487753,
        gasMultiplier: 2,

        AddressToToken: addressToToken,
        TokenToAddress: (token: string) => {
            return tokenConfig[token].address;
        },
        ...tokenConfig[token],
    };
};
