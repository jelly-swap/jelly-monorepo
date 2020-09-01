import { ethers } from 'ethers';

export default class Web3Provider {
    constructor(web3Provider: any) {
        return new ethers.providers.Web3Provider(web3Provider);
    }
}
