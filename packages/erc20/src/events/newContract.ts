export default (args: any[], config: any, txHash?: any) => {
    const transactionHash = args[10] ? args[10].transactionHash : txHash;
    const tokenAddress = args[5].toLowerCase();
    const token = config.AddressToToken[tokenAddress].network;

    if (token) {
        const result = {
            network: token,
            eventName: 'NEW_CONTRACT',
            id: args[3],
            hashLock: args[4],
            tokenAddress,
            sender: args[6],
            receiver: args[7],
            inputAmount: args[0].toString(),
            outputAmount: args[1].toString(),
            expiration: args[2].toString(),
            outputNetwork: args[8].toString(),
            outputAddress: args[9],
            transactionHash,
        };

        return result;
    } else {
        console.error(`Token not supported: ${tokenAddress}`);
    }
};

// event NewContract(
//     uint256 inputAmount,
//     uint256 outputAmount,
//     uint256 expiration,
//     bytes32 id,
//     bytes32 hashLock,
//     address indexed tokenAddress,
//     address indexed sender,
//     address indexed receiver,
//     string outputNetwork,
//     string outputAddress
//   );
