import algosdk from 'algosdk';
import createHash from 'create-hash';

export const createHashImg = (entropy: string) => {
    const secretKey = createHash('sha256').update(entropy).digest();

    return Buffer.from(secretKey as any, 'hex').toString('base64');
};

export const fundHTLCContract = async (
    params: any,
    htlc: any,
    senderWallet: any,
    amount = 1000000,
    algodClient: any
) => {
    let note = algosdk.encodeObj('J_NEW_CONTRACT');

    let txn = algosdk.makePaymentTxnWithSuggestedParams(
        senderWallet.addr,
        htlc.getAddress(),
        amount,
        undefined,
        note,
        params
    );

    let signedTxn = txn.signTxn(senderWallet.sk);

    try {
        const tx = await algodClient.sendRawTransaction(signedTxn).do();

        return tx.txId;
    } catch (error) {
        console.log('Error funding HTLC  contract', error);
    }
};
