import TronGrid from 'trongrid';
import Config from '../config';

export default class TronlinkProvider {
    constructor(tronwewb: any) {
        return new TronGrid(tronwewb);
    }
}
