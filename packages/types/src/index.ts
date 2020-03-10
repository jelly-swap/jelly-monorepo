export interface ContractSwap {
    network: string;
    outputAmount: string | number;
    expiration: string | number;
    sender: string;
    hashLock: string;
    receiver: string;
    outputNetwork: string;
    outputAddress: string;
    inputAmount: string | number;
    id?: string;
    options?: Options;
}

export interface ContractWithdraw {
    id: string;
    secret: string;
}

export interface ContractRefund {
    id: string;
}

export interface SwapEvent {
    eventName: string;
    id: string;
    sender: string;
    receiver: string;
    outputNetwork: string;
    outputAddress: string;
    inputAmount: string | number;
    outputAmount: string | number;
    expiration: string | number;
    hashLock: string;
}

export interface RefundEvent {
    eventName: string;
    id: string;
    sender: string;
    receiver: string;
    hashLock: string;
}

export interface WithdrawEvent {
    eventName: string;
    id: string;
    sender: string;
    receiver: string;
    hashLock: string;
    secret: string;
}

export interface UserInputSwap {
    network: string;
    inputAmount: string | number;
    outputNetwork: string;
    outputAmount: string | number;
    sender: string;
    outputAddress: string;
    secret: string;
}

export interface JellyAdapter {
    createSwapFromInput(inputSwap: ContractSwap, sender?: string): ContractSwap;

    addressValid(address: string): boolean;

    parseAddress(address: string): string;

    parseOutputAddress(address: string): string;

    parseToNative(amount: string): string | number;

    parseFromNative(amount: string): string | number;

    formatInput(data: UserInputSwap, receiver: string): ContractSwap;

    generateId(swap: ContractSwap): string;
}

export interface JellyContract {
    subscribe(onMessage: Function, filter?: Function): void;

    getPastEvents(type: string, filter: Function): any;

    getCurrentBlock(): Promise<string | number>;

    getBalance(address: string): Promise<string | number>;

    newContract(swap: ContractSwap): Promise<string>;

    withdraw(withdraw: ContractWithdraw): Promise<string>;

    refund(refund: ContractRefund): Promise<string>;

    getStatus(ids: any[]): any;
}

type Options = {
    amount?: any;
    value?: any;
};

export interface EventFilter {
    sender?: string;
    receiver?: string;
    outputNetwork?: string;
    outputAddress?: string;
}
export interface Filter {
    new?: EventFilter;
    withdraw?: EventFilter;
    refund?: EventFilter;
}
