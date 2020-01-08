import TronGrid from 'trongrid';
import Config from '../config';

export default class TronlinkProvider {
    constructor(tronweb: any) {
        return new TronGrid(tronweb);
    }
}
