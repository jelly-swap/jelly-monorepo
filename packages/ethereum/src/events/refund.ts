// event Refund(
//     bytes32 indexed id,
//     bytes32 hashLock,
//     address indexed sender,
//     address indexed receiver
//   );
export default (args: any[], txHash?: any) => {
    const transactionHash = args[4] ? args[4].transactionHash : txHash;

    const result = {
        network: 'ETH',
        eventName: 'REFUND',
        id: args[0],
        hashLock: args[1],
        sender: args[2],
        receiver: args[3],
        transactionHash,
    };

    return result;
};
