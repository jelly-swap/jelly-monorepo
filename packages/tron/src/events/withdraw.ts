// event Withdraw(
//     bytes32 indexed id,
//     bytes32 secret,
//     bytes32 hashLock,
//     address indexed sender,
//     address indexed receiver
//   );

export default (event: any) => {
    const receiver = event.result.receiver;

    const result = {
        network: 'TRX',
        eventName: 'WITHDRAW',
        id: '0x' + event.result.id,
        hashLock: '0x' + event.result.hashLock,
        sender: event.result.sender,
        receiver,
        secret: event.result.secret,
        transactionHash: event.transaction_id || event.transaction,
    };

    return result;
};
