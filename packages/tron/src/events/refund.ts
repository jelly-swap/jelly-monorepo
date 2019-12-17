import { Adapter } from '..';

// event Refund(
//     bytes32 indexed id,
//     bytes32 hashLock,
//     address indexed sender,
//     address indexed receiver
//   );

export default (event: any, adapter: Adapter) => {
    const result = {
        network: 'TRX',
        eventName: 'REFUND',
        id: '0x' + event.result.id,
        hashLock: '0x' + event.result.hashLock,
        sender: adapter.parseAddress(event.result.sender),
        receiver: adapter.parseAddress(event.result.receiver),
        transactionHash: event.transaction_id || event.transaction,
    };

    return result;
};
