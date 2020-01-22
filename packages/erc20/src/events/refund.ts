export default (args: any[], config: any, txHash?: any) => {
    const transactionHash = args[5] ? args[5].transactionHash : txHash;
    const tokenAddress = args[2].toLowerCase();
    const token = config.AddressToToken[tokenAddress].network;

    if (token) {
        const result = {
            network: token,
            eventName: 'REFUND',
            id: args[0],
            hashLock: args[1],
            tokenAddress,
            sender: args[3],
            receiver: args[4],
            transactionHash,
        };

        return result;
    } else {
        console.error(`Token not supported: ${tokenAddress}`);
    }
};

// event Refund(
//     bytes32 id,
//     bytes32 hashLock,
//     address indexed tokenAddress,
//     address indexed sender,
//     address indexed receiver
//   );
