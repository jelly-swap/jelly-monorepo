export default class Event {
    async getPast(type: string, filter?: any, currentBlock?: string | number) {
        throw new Error('Method not implemented.');
    }

    async subscribe(onMessage: Function, filter?: Function) {
        throw new Error('Method not implemented.');
    }
}
