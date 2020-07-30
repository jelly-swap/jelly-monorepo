// const Web3 = require('web3');
// const web3 = new Web3();
// const TEST = 'https://testapi.avax.network/ext/bc/C/rpc';
// const provider = web3.setProvider(new web3.providers.HttpProvider(TEST));

// web3.eth.getGasPrice().then(console.log);

// web3.eth.getTransaction('0x9c421c8cc3ffea40e59a138d7d6c97f9249102f6a46daee5f6e69d25db3af703').then(console.log);

// console.log('prov', provider);

import JSONRpc from './providers/jsonRpc';
import AvaContract from './contract';

const provider = new JSONRpc();

const avaContract = new AvaContract(provider);

provider.getBlockNumber().then(console.log);

provider.getTransaction('0x9c421c8cc3ffea40e59a138d7d6c97f9249102f6a46daee5f6e69d25db3af703').then(console.log);
