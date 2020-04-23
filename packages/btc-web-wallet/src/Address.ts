export default class Address {
    public address: string;
    public derivationPath: string;
    public publicKey: Buffer;
    public index: number;
    public change: boolean;

    constructor(address: string, derivationPath: string, publicKey: Buffer, index: number, change: boolean) {
        this.address = address;
        this.derivationPath = derivationPath;
        this.publicKey = publicKey;
        this.index = index;
        this.change = change;
    }

    toString() {
        return this.address;
    }

    valueOf() {
        return this.address;
    }

    equals(address: string) {
        return this.address === addressToString(address);
    }
}

function addressToString(address: string | Address) {
    if (typeof address === 'string') {
        return address;
    }

    return address.address;
}

export { addressToString };
