
# Getting started

    yarn add @jelly-swap/erc20
or

    npm install @jelly-swap/erc20
    
# Setup

    import { Providers, Contract, Config, Adapter } from  '@jelly-swap/erc20';
### Configuration

    const  SWAP_EXPIRATION_TIME = 86400; // 1 DAY
        
    export  const  TokenConfig = {
	    DAI: {   
		    network:  'DAI',
		    decimals:  18,
		    address:  '0x6b175474e89094c44da98b954eedeac495271d0f',    
	    },
    };
  
    export  const  AddressToToken = {
	    '0x6b175474e89094c44da98b954eedeac495271d0f':  TokenConfig.DAI,
    };
    
    const  config = {
	    ...Config('DAI', TokenConfig, AddressToToken, SWAP_EXPIRATION_TIME),
	    receiverAddress:  'LIQUIDITY_PROVIDER_ADDRESS',
	    providerUrl:  'INFURA_URL',
    };

### ERC20 Provider
##### Web Wallet

    const  privateKey = 'PRIVATE_KEY';
    const  provider = new  Providers.WalletProvider(privateKey, config.providerUrl);
##### Web3

    const provider = new Providers.Web3Provider(window.ethereum)

  ### DAI Adapter

    const  adapter = new  Adapter('DAI', config);
### ERC20 Contract

    const  contract = new  Contract(wallet, config);

# Initiate a swap

    const  userInput = {
	    network:  'DAI',
	    inputAmount:  '85.0542', // DAI amount
	    
	    outputNetwork:  'BTC',
	    outputAmount:  '960400', // BTC amount
	    
	    sender:  '0x45ce9d7bdadb704c68242118e2b8586e491e5c51', // user's DAI address
	    outputAddress:  'bc1q9zh2n6yqun8syggzx6kqlkema5qw9nrz7he90l', // user's BTC address
	    
	    secret:  'film ritual cream paper try search asthma grab admit viable work auction',
	    tokenAddress:  TokenConfig.DAI.address,
    };
    
    const  swapInput = adapter.formatInput(userInput);
    
    console.log(swapInput);
    {
	    network: 'DAI',
	    inputAmount: '85054200000000000000',
	    outputNetwork: 'BTC',
	    outputAmount: '960400',
	    sender: '0x45ce9d7bdadb704c68242118e2b8586e491e5c51',
	    outputAddress: 'bc1q9zh2n6yqun8syggzx6kqlkema5qw9nrz7he90l',
	    secret: 'film ritual cream paper try search asthma grab admit viable work auction',
	    hashLock: '0xee4aad2300d4d8d3f5f58719201ded5a65e00dbda8c3ba0bd066cf3a365e9b73',
	    receiver: 'LIQUIDITY_PROVIDER_ADDRESS',
	    expiration: 1588587562,
    };
        
    const  txHash = await  contract.newContract(swapInput);
    
# Subscribe

    contract.subscribe(callback, {
    	new: {
    		receiver:  'USER_ADDRESS',
    		sender:  'USER_ADDRESS',
    	},
    	withdraw: {
    		receiver:  'USER_ADDRESS',
    	},
    	refund: {
    		sender:  'USER_ADDRESS',
    	},
    });

    const  callback = (event) => {

    console.log(event);
  

    {
		eventName:  'NEW_CONTRACT',
		network:  'DAI',
		inputAmount:  '30000000000000000000',
		outputNetwork:  'BTC',
		outputAmount:  429100,
		expiration:  1585971331,
		id:  '0xfce96561a13d0a1732e818af24a00af9da19ded340c61089cc7bc9c3fdb189df',
		hashLock:  '0x3ba1dc9d7e65a4fdcd0136771f85c8321e239bac772dbd5589f7dd481b2dd52c',
		tokenAddress:  '0x6b175474e89094c44da98b954eedeac495271d0f',
		sender:  '0x77C0fd531157050FeBfCaD81DB27DB87ed8319f5',
		isSender:  true,
		receiver:  '0x44EED7dE9A8bBF75e88afe4507D10767965CBef6',
		outputAddress:  'bc1qpz6zc3ve7jwfzzveeuv0qhh2536y4qfav07qx3',
		transactionHash:  '0x7e78ab376fd11926fdedf8f8cf5c9e91f5592d31d37b165638db6bdb1d1b0bb3',
    };
    
    {
    	eventName:  'WITHDRAW',
    	network:  'DAI',
    	id:  '0x3626d9312d4900da7a1381c36b7bfad82f81516686f6500ef8305b9f824fcb17',
    	secret:  '0x6ea6731d7ee4519794dbb2b02885af743725ca5270626664110d34f37f410508',
    	hashLock:  '0x85ad0744375881b9962031fe5be3bf63a2fb132bf5755ee1c64142615a667934',
    	tokenAddress:  '0x6b175474e89094c44da98b954eedeac495271d0f',
    	sender:  '0x44EED7dE9A8bBF75e88afe4507D10767965CBef6',
    	receiver:  '0xdd74dd2697206A910c42F9f5EF8c760A306483b8',
    	transactionHash:  '0x1a1cfc5cb1cf6b09a3ccc61688c321c2429d22406c3dc1274d94ea5db1519bc2',
    };

# Get Past Events

    const  type = 'new' || 'withdraw' || 'refund';
    const  pastEvents = await  contract.getPastEvents(type, {
		new: {
			receiver:  filterAddress,
			sender:  filterAddress,
		},
		withdraw: {
			receiver:  filterAddress,
		},
		refund: {
			sender:  filterAddress,
		},
	});

    console.log(pastEvents);

#### New Contract
    [
	    {	 
			eventName:  'NEW_CONTRACT',
			network:  'DAI',
			inputAmount:  '30000000000000000000',
			outputNetwork:  'BTC',
			outputAmount:  429100,
			expiration:  1585971331,
			id:  '0xfce96561a13d0a1732e818af24a00af9da19ded340c61089cc7bc9c3fdb189df',
			hashLock:  '0x3ba1dc9d7e65a4fdcd0136771f85c8321e239bac772dbd5589f7dd481b2dd52c',
			tokenAddress:  '0x6b175474e89094c44da98b954eedeac495271d0f',
			sender:  '0x77C0fd531157050FeBfCaD81DB27DB87ed8319f5',
			isSender:  true,
			receiver:  '0x44EED7dE9A8bBF75e88afe4507D10767965CBef6',
			outputAddress:  'bc1qpz6zc3ve7jwfzzveeuv0qhh2536y4qfav07qx3',
			transactionHash:  '0x7e78ab376fd11926fdedf8f8cf5c9e91f5592d31d37b165638db6bdb1d1b0bb3',
		},
	    ...
    ];
#### Withdraw
    [
	    {
	    	eventName:  'WITHDRAW',
	    	network:  'DAI',
	    	id:  '0x3626d9312d4900da7a1381c36b7bfad82f81516686f6500ef8305b9f824fcb17',
	    	secret:  '0x6ea6731d7ee4519794dbb2b02885af743725ca5270626664110d34f37f410508',
	    	hashLock:  '0x85ad0744375881b9962031fe5be3bf63a2fb132bf5755ee1c64142615a667934',
	    	tokenAddress:  '0x6b175474e89094c44da98b954eedeac495271d0f',
	    	sender:  '0x44EED7dE9A8bBF75e88afe4507D10767965CBef6',
	    	receiver:  '0xdd74dd2697206A910c42F9f5EF8c760A306483b8',
	    	transactionHash:  '0x1a1cfc5cb1cf6b09a3ccc61688c321c2429d22406c3dc1274d94ea5db1519bc2',
	    },
	    ....
    ]
