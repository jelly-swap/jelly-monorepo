import JSONRpc from './providers/jsonRpc';
import MaticContract from './contract';

const provider = new JSONRpc();

const maticContract = new MaticContract(provider);

provider.getBlockNumber().then(console.log);

provider.getTransaction('0x7942cf762c11e01a90c6ffab885323cd8e74d37cbfed25d9dc7c4799ea33084c').then(console.log);
