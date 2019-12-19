import { TokenConfigType, AddressToTokenMap } from '../types';

export const TokenConfig: TokenConfigType = {
    DAI: {
        network: 'DAI',
        decimals: 18,
        address: '0x2d69ad895797c880abce92437788047ba0eb7ff6',
    },
};

export const AddressToToken: AddressToTokenMap = {
    '0x2d69ad895797c880abce92437788047ba0eb7ff6': TokenConfig.DAI,
};

export const tokenToAddress = (token: string) => {
    return TokenConfig[token].address;
};
