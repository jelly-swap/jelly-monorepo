export default class Event {
    async getPast(type: string, filter?: any, currentBlock?: string | number) {}

    async subscribe(onMessage: Function, filter?: Function) {}
}
