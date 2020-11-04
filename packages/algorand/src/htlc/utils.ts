import algosdk from 'algosdk';

export const fundHTLCContract = async (
    params: any,
    htlc: any,
    senderWallet: any,
    amount: any,
    algodClient: any,
    metadata: any
) => {
    const note = formatNote(metadata);

    const txn = algosdk.makePaymentTxnWithSuggestedParams(
        senderWallet.address,
        htlc.getAddress(),
        amount,
        undefined,
        note,
        params
    );

    const signedTxn = txn.signTxn(senderWallet.privateKey);

    return await algodClient.sendRawTransaction(signedTxn, metadata);
};

export const formatNote = (note: any) => algosdk.encodeObj(JSON.stringify(note));
