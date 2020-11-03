import algosdk from 'algosdk';

export const fundHTLCContract = async (
    params: any,
    htlc: any,
    senderWallet: any,
    amount = 1000000,
    algodClient: any,
    metadata: any,
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

    try {
        const tx = await algodClient.sendRawTransaction(signedTxn, metadata);
        return tx;
    } catch (error) {
        throw error;
    }
};


export const formatNote = (note: any) => {
    return algosdk.encodeObj(JSON.stringify(note));
}