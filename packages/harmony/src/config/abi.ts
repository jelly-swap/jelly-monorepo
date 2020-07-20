export default [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'inputAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'outputAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'expiration',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'hashLock',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'string',
                name: 'outputNetwork',
                type: 'string',
            },
            {
                indexed: false,
                internalType: 'string',
                name: 'outputAddress',
                type: 'string',
            },
        ],
        name: 'NewContract',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'hashLock',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'Refund',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'hashLock',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'Withdraw',
        type: 'event',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        name: 'contracts',
        outputs: [
            {
                internalType: 'uint256',
                name: 'inputAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'outputAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'expiration',
                type: 'uint256',
            },
            {
                internalType: 'bytes32',
                name: 'hashLock',
                type: 'bytes32',
            },
            {
                internalType: 'enum HashTimeLock.SwapStatus',
                name: 'status',
                type: 'uint8',
            },
            {
                internalType: 'address payable',
                name: 'sender',
                type: 'address',
            },
            {
                internalType: 'address payable',
                name: 'receiver',
                type: 'address',
            },
            {
                internalType: 'string',
                name: 'outputNetwork',
                type: 'string',
            },
            {
                internalType: 'string',
                name: 'outputAddress',
                type: 'string',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'uint256',
                name: 'outputAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'expiration',
                type: 'uint256',
            },
            {
                internalType: 'bytes32',
                name: 'hashLock',
                type: 'bytes32',
            },
            {
                internalType: 'address payable',
                name: 'receiver',
                type: 'address',
            },
            {
                internalType: 'string',
                name: 'outputNetwork',
                type: 'string',
            },
            {
                internalType: 'string',
                name: 'outputAddress',
                type: 'string',
            },
        ],
        name: 'newContract',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
            {
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32',
            },
        ],
        name: 'withdraw',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
        ],
        name: 'refund',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
        ],
        name: 'getContract',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'inputAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'outputAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'expiration',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'hashLock',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'enum HashTimeLock.SwapStatus',
                        name: 'status',
                        type: 'uint8',
                    },
                    {
                        internalType: 'address payable',
                        name: 'sender',
                        type: 'address',
                    },
                    {
                        internalType: 'address payable',
                        name: 'receiver',
                        type: 'address',
                    },
                    {
                        internalType: 'string',
                        name: 'outputNetwork',
                        type: 'string',
                    },
                    {
                        internalType: 'string',
                        name: 'outputAddress',
                        type: 'string',
                    },
                ],
                internalType: 'struct HashTimeLock.LockContract',
                name: '',
                type: 'tuple',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
        ],
        name: 'contractExists',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'bytes32[]',
                name: 'ids',
                type: 'bytes32[]',
            },
        ],
        name: 'getStatus',
        outputs: [
            {
                internalType: 'uint8[]',
                name: '',
                type: 'uint8[]',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'bytes32',
                name: 'id',
                type: 'bytes32',
            },
        ],
        name: 'getStatus',
        outputs: [
            {
                internalType: 'uint8',
                name: 'result',
                type: 'uint8',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
];
