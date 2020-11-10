import algosdk from 'algosdk';

export const sendTx = async (wallet: any, to: string, amount: number, metadata: any) => {
    const params = await wallet.provider.getTransactionParams();

    const note = formatNote(metadata);

    const txn = algosdk.makePaymentTxnWithSuggestedParams(wallet.address, to, Number(amount), undefined, note, params);

    const signedTxn = txn.signTxn(wallet.privateKey);

    return await wallet.provider.sendRawTransaction(signedTxn, metadata);
};

export const formatNote = (note: any) => algosdk.encodeObj(JSON.stringify(note));
