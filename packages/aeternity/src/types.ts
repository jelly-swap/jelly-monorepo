export {
    ContractSwap,
    ContractWithdraw,
    ContractRefund,
    SwapEvent,
    WithdrawEvent,
    RefundEvent,
    JellyContract,
    UserInputSwap,
    JellyAdapter,
    Filter,
} from '@jelly-swap/types';

export interface Provider {
    setup(): void;

    setupRpc(wallet: any, onAddressChange: Function, onNetworkChange: Function): Promise<any>;

    callContract(method: string, args: any[], options?: any): Promise<any>;

    getCurrentBlock(): Promise<string | number>;

    getAeBalance(address: string): Promise<string | number>;

    getTxInfo(txHash: string): Promise<TxInfo>;
}

type TxInfo = {
    log: [];
};
