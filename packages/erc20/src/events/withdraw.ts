export default (args: any[], config: any, txHash?: any) => {
    const transactionHash = args[6] ? args[6].transactionHash : txHash;
    const tokenAddress = args[3].toLowerCase();
    const token = config.AddressToToken[tokenAddress].network;

    if (token) {
        const result = {
            network: token,
            eventName: 'WITHDRAW',
            id: args[0],
            secret: args[1],
            hashLock: args[2],
            tokenAddress,
            sender: args[4],
            receiver: args[5],
            transactionHash,
        };

        return result;
    } else {
        console.error(`Token not supported: ${tokenAddress}`);
    }
};

// event Withdraw(
//     bytes32 id,
//     bytes32 secret,
//     bytes32 hashLock,
//     address indexed tokenAddress,
//     address indexed sender,
//     address indexed receiver
//   );
