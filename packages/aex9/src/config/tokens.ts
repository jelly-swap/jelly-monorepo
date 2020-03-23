import { TokenConfigType, AddressToTokenMap } from '../types';

export const TokenConfig: TokenConfigType = {
    AES: {
        network: 'AES',
        decimals: 18,
        address: 'ak_W7eaCPkWK4rx16DiDUR29vQW1T5f53ET3fJxSLNRPJWWE46tU',
    },
};

export const AddressToToken: AddressToTokenMap = {
    ak_W7eaCPkWK4rx16DiDUR29vQW1T5f53ET3fJxSLNRPJWWE46tU: TokenConfig.AES,
};
