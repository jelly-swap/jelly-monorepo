export const AddressTypes = ['legacy', 'p2sh-segwit', 'bech32'];

export const AddressTypeToPrefix: AddressPrefix = {
    legacy: 44,
    'p2sh-segwit': 49,
    bech32: 84,
};

type AddressPrefix = {
    [key: string]: number;
};
