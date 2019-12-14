// event Withdraw(
//     bytes32 indexed id,
//     bytes32 secret,
//     bytes32 hashLock,
//     address indexed sender,
//     address indexed receiver
//   );

export default (args: any[], txHash?: any) => {
    const transactionHash = args[5] ? args[5].transactionHash : txHash;

    const result = {
        network: 'ETH',
        eventName: 'WITHDRAW',
        id: args[0],
        secret: args[1],
        hashLock: args[2],
        sender: args[3],
        receiver: args[4],
        transactionHash,
    };

    return result;
};
