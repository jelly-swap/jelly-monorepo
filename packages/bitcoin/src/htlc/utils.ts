import { payments as BitcoinPayments, script as BitcoinScript, address as BitcoinAddress } from 'bitcoinjs-lib';

export const getSwapInput = (sig: any, pubKey: Buffer, isRedeem: boolean, secret: string) => {
    const OPS = BitcoinScript.OPS;
    const redeem = isRedeem ? OPS.OP_TRUE : OPS.OP_FALSE;
    const secretParams = isRedeem ? [Buffer.from(secret, 'hex')] : [];
    return BitcoinScript.compile([sig, pubKey, ...secretParams, redeem]);
};

export const getSwapOutput = (
    recipientAddress: string,
    refundAddress: string,
    hashLock: string,
    expiration: number
) => {
    const recipientPubKeyHash = getPubKeyHash(recipientAddress);
    const refundPubKeyHash = getPubKeyHash(refundAddress);
    const OPS = BitcoinScript.OPS;

    return BitcoinScript.compile([
        OPS.OP_IF,
        OPS.OP_SIZE,
        BitcoinScript.number.encode(32),
        OPS.OP_EQUALVERIFY,
        OPS.OP_SHA256,
        Buffer.from(hashLock, 'hex'),
        OPS.OP_EQUALVERIFY,
        OPS.OP_DUP,
        OPS.OP_HASH160,
        recipientPubKeyHash,
        OPS.OP_ELSE,
        BitcoinScript.number.encode(expiration),
        OPS.OP_CHECKLOCKTIMEVERIFY,
        OPS.OP_DROP,
        OPS.OP_DUP,
        OPS.OP_HASH160,
        refundPubKeyHash,
        OPS.OP_ENDIF,
        OPS.OP_EQUALVERIFY,
        OPS.OP_CHECKSIG,
    ]);
};

export const getSwapPaymentVariants = (swapOutput: any, network: any) => {
    const p2wsh = BitcoinPayments.p2wsh({
        redeem: { output: swapOutput, network },
        network,
    });

    const p2shSegwit = BitcoinPayments.p2sh({
        redeem: p2wsh,
        network,
    });

    const p2sh = BitcoinPayments.p2sh({
        redeem: { output: swapOutput, network },
        network,
    });

    return { p2wsh, p2shSegwit, p2sh } as any;
};

export const calculateFee = (numInputs: number, numOutputs: number, feePerByte: number) => {
    return (numInputs * 148 + numOutputs * 34 + 10) * feePerByte; // TODO: fix this magic :X
};

const getPubKeyHash = (address: string) => {
    try {
        const bech32 = BitcoinAddress.fromBech32(address);
        return bech32.data;
    } catch (e) {
        const base58 = BitcoinAddress.fromBase58Check(address);
        return base58.hash;
    }
};
