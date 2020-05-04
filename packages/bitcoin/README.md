
# Getting started

    yarn add @jelly-swap/bitcoin
    yarn add @jelly-swap/btc-web-wallet
or

    npm install @jelly-swap/bitcoin
    npm install @jelly-swap/btc-web-wallet

# Setup

    import { Providers, Contract, Config, Adapter } from  '@jelly-swap/bitcoin';
### Configuration
    const  SWAP_EXPIRATION_TIME = 86400; // 1 DAY
    
    const  config = { 
	    ...Config(SWAP_EXPIRATION_TIME),
	    receiverAddress:  'LIQUIDITY_PROVIDER_ADDRESS',
	    providerUrl:  'https://spacejelly.network/btc/api/v1/btc/',
    };

### BTC Provider

    const  provider = new  Providers.BitcoinProvider(config.providerUrl);
### BTC Web Wallet

    const  mnemonic = 'choose stone donkey wheat pudding gasp harsh pupil sibling post brief afraid';
    const  wallet = new  Wallet(mnemonic, provider);

  ### BTC Adapter

    const  adapter = new  Adapter(config);
### BTC Contract

    const  contract = new  Contract(wallet, config);

# Initiate a swap

    const  userInput = {
    	network:  'BTC',
    	inputAmount:  '0.01', // BTC amount
    	outputNetwork:  'DAI',
    	outputAmount:  '84212086000000000000', // DAI amount
    	sender:  'bc1q9zh2n6yqun8syggzx6kqlkema5qw9nrz7he90l', // user's BTC address
    	outputAddress:  '0x45ce9d7bdadb704c68242118e2b8586e491e5c51', // user's DAI address
    	secret:  'film ritual cream paper try search asthma grab admit viable work auction',
    };
    
    const  swapInput = adapter.formatInput(userInput);
    console.log(swapInput);
    {
	    network: 'BTC',
	    inputAmount: '1000000',
	    outputNetwork: 'DAI',
	    outputAmount: '84212086000000000000',
	    sender: 'bc1q9zh2n6yqun8syggzx6kqlkema5qw9nrz7he90l',
	    outputAddress: '0x45ce9d7bdadb704c68242118e2b8586e491e5c51',
	    secret: 'film ritual cream paper try search asthma grab admit viable work auction',
	    hashLock: '0xee4aad2300d4d8d3f5f58719201ded5a65e00dbda8c3ba0bd066cf3a365e9b73',
	    receiver: 'tb1qc4mwllgvmy0xqsdexpm5v8g74ldmv698whnyrw',
	    expiration: 1588587562,
    };
    
    const  txHash = await  contract.newContract(swapInput);
    
# Subscribe

    contract.subscribe(callback, {
	    new: {
		    type:  'getSwapsByAddressAndBlock',
		    address:  'USER_ADDRESS', 
	    },
	    withdraw: {
		    type:  'getWithdrawByReceiverAndBlock',
		    address:  'USER_ADDRESS',
	    },
    });

    const  callback = (event) => {

    console.log(event);
  
    {
   	    eventName: 'NEW_CONTRACT',
   	    network: 'BTC',
   	    inputAmount: 5604499,
   	    outputNetwork: 'DAI',
   	    outputAmount: '2398272000000000000',
   	    sender: 'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
   	    isSender: true,
   	    outputAddress: '0xdf9cb34d9dd92d54cec4150bd1518202e391479c',
   	    receiver: 'bc1qwjeylyfrkn8sckwux789dqtscafujhgy4xcddg',
   	    refundAddress: 'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
   	    id: '0x4a04b233272a95a01827a099becc3136899cdc0a0c0c9b32b7c705ee6644ff3f',
   	    transactionHash: '03cad639ffb7880b9cd62794f91517865526db9d084a7e3b4b1c3cba6c98d956',
   	    status: 1,
   	    expiration: 1588651138,
   	    blockHeight: 628836,
   	    hashLock: '0xbb380eead9fa13e6388a245397950995ce72093d1d5ebe0b19ecc8767b0e1a40',
    };
    
    {
	    eventName: 'WITHDRAW',
	    network: 'BTC',
	    id: '0x4a04b233272a95a01827a099becc3136899cdc0a0c0c9b32b7c705ee6644ff3f',
	    transactionHash: 'b58a0ea14b58319d589d0a2b740715ec2d036bd67bac257eb8e78b663e9943e7',
	    secret: '0x357bce78906a196afc7089c3005134bbca0b09d876e8e3c911427579fa8c2f3e',
	    hashLock: '0xbb380eead9fa13e6388a245397950995ce72093d1d5ebe0b19ecc8767b0e1a40',
	    sender: 'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
	    receiver: 'bc1qwjeylyfrkn8sckwux789dqtscafujhgy4xcddg',
	    blockHeight: 628849,
    };

# Get Past Events

      const  type = 'new' || 'withdraw';
      const  pastEvents = await  contract.getPastEvents(type, {
	  	    new: { 
	  		    type:  'getSwapsByAddress',
	  		    address:  'USER_ADDRESS',   
	  	    },
	  	    withdraw: {
	  		    type:  'getWithdrawByReceiver',
	  		    address:  'USER_ADDRESS',
	  	    },
      });

    console.log(pastEvents);

#### New Contract
    [
	    {   
	    network:  'BTC',
	    inputAmount:  5604499,
	    outputNetwork:  'DAI',
	    outputAmount:  '2398272000000000000',
	    sender:  'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
	    isSender:  true,
	    outputAddress:  '0xdf9cb34d9dd92d54cec4150bd1518202e391479c',
	    receiver:  'bc1qwjeylyfrkn8sckwux789dqtscafujhgy4xcddg',
	    refundAddress:  'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
	    id:  '0x4a04b233272a95a01827a099becc3136899cdc0a0c0c9b32b7c705ee6644ff3f',
	    transactionHash:  '03cad639ffb7880b9cd62794f91517865526db9d084a7e3b4b1c3cba6c98d956',
	    hashLock:  '0xbb380eead9fa13e6388a245397950995ce72093d1d5ebe0b19ecc8767b0e1a40',
	    status:  1,
	    expiration:  1588651138, 
	    blockHeight:  628836,
	    },
	    ...
    ];
#### Withdraw
    [
	    {
		    network: 'BTC',
		    id: '0x4a04b233272a95a01827a099becc3136899cdc0a0c0c9b32b7c705ee6644ff3f',
		    transactionHash: 'b58a0ea14b58319d589d0a2b740715ec2d036bd67bac257eb8e78b663e9943e7',
		    secret: '0x357bce78906a196afc7089c3005134bbca0b09d876e8e3c911427579fa8c2f3e',
		    hashLock: '0xbb380eead9fa13e6388a245397950995ce72093d1d5ebe0b19ecc8767b0e1a40',
		    sender: 'bc1q7fnkalepy69yuh5f5axrzt4xyz8dxwwwxcwfxk',
		    receiver: 'bc1qwjeylyfrkn8sckwux789dqtscafujhgy4xcddg',
		    blockHeight: 628849,
	    },
	    ....
    ]
