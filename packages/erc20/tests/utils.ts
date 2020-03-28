import { utils } from 'ethers';

import { Config, Providers } from '../src';
import { TokenConfig, AddressToToken } from '../src/config/tokens';

export const ADDRESS = '0x72A0835b6B001c1B96e49Ec44283ae23F3936322';

export const generateSecret = (secret: string) => {
    return utils.soliditySha256(['string'], [secret]);
};

export const getConfig = (expiration: number) => {
    return Config('DAI', TokenConfig, AddressToToken, expiration);
};

export const getFilter = (address = ADDRESS) => {
    return {
        new: {
            receiver: address,
            sender: address,
        },
        withdraw: {
            receiver: address,
        },
        refund: {
            sender: address,
        },
    };
};

export const getProvider = () => {
    return new Providers.WalletProvider(
        '3EE89553F5524191A80A4230B015A0781898B2D97B7D74FC16E027604B05FF3C',
        'https://ropsten.infura.io/v3/8fe4fc9626494d238879981936dbf144'
    );
};

export const wait = async (minutes: number) => {
    await new Promise(r => setTimeout(r, minutes * 60 * 1000));
};
