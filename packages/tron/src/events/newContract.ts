// event NewContract(
//     uint256 inputAmount,
//     uint256 outputAmount,
//     uint256 expiration,
//     bytes32 indexed id,
//     bytes32 hashLock,
//     address indexed sender,
//     address indexed receiver,
//     string outputNetwork,
//     string outputAddress
//   );

export default (event: any) => {
    const result = {
        network: 'TRX',
        eventName: 'NEW_CONTRACT',
        id: '0x' + event.result.id,
        receiver: event.result.receiver,
        sender: event.result.sender,
        transactionHash: event.transaction_id || event.transaction,
        expiration: event.result.expiration.toString(),
        inputAmount: event.result.inputAmount.toString(),
        outputAmount: event.result.outputAmount.toString(),
        outputNetwork: event.result.outputNetwork.toString(),
        hashLock: '0x' + event.result.hashLock,
        outputAddress: event.result.outputAddress,
    };

    return result;
};
