import algosdk from 'algosdk';
import { fixHash } from '@jelly-swap/utils';

export const sendTx = async (wallet: any, to: string, amount: number, metadata: any, htlcProgram: any, secret: any) => {
    const params = await wallet.provider.getTransactionParams();

    const txn = {
        from: wallet.address,
        to,
        fee: params.fee,
        type: 'axfer',
        amount: Number(amount),
        firstRound: params.firstRound,
        lastRound: params.lastRound,
        genesisID: params.genesisID,
        genesisHash: params.genesisHash,
        closeRemainderTo: wallet.address,
        note: formatNote(metadata),
        assetIndex: 19267953
    };

    const lsig = algosdk.makeLogicSig(htlcProgram, [Buffer.from(fixHash(secret, false), 'hex')]);
    const rawSignedTxn = algosdk.signLogicSigTransaction(txn, lsig);

    return await wallet.provider.sendRawTransaction(rawSignedTxn.blob, metadata);
};

export const formatNote = (note: any) => algosdk.encodeObj(JSON.stringify(note));
