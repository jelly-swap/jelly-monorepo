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
export default (args: any[], txHash?: any) => {
    const transactionHash = args[9] ? args[9].transactionHash : txHash;

    const result = {
        network: 'ETH',
        eventName: 'NEW_CONTRACT',
        id: args[3],
        hashLock: args[4],
        sender: args[5],
        receiver: args[6],
        inputAmount: args[0].toString(),
        outputAmount: args[1].toString(),
        expiration: args[2].toString(),
        outputNetwork: args[7].toString(),
        transactionHash,
    };

    return result;
};
