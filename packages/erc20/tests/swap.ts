import { Contract, Adapter } from '../src';

import { getConfig, getFilter, ADDRESS, getProvider } from './utils';

export default () => {
    const config = getConfig(300);
    const receiver = ADDRESS;

    const swap = {
        sender: ADDRESS,
        inputAmount: 1,
        network: 'DAI',
        outputNetwork: 'ETH',
        outputAmount: '1000000000000000',
        outputAddress: ADDRESS,
        secret: 'some_long_and_complicated_secret',
        tokenAddress: config.address,
    };

    const contract = new Contract(getProvider(), config);

    const adapter = new Adapter('DAI', config);

    describe('Swap', () => {
        let swapEventResult: any;
        let swapId: string;

        it(
            'should broadcast new swap transaction',
            async () => {
                const input = adapter.formatInput(swap, receiver);

                swapId = adapter.generateId(input);

                const result = await contract.newContract(input);

                expect(result).toBeDefined();

                console.log('SWAP TX HASH: ', result);
            },
            5 * 60 * 1000
        );

        it(
            'should receive swap event',
            async (done) => {
                contract.subscribe((result: any) => {
                    swapEventResult = result;

                    console.log('SWAP EVENT: ', result);

                    expect(result.eventName).toBe('NEW_CONTRACT');
                    expect(result.network).toBe('DAI');
                    expect(result.id).toBe(swapId);
                    expect(result.inputAmount).toBe('1000000000000000000');
                    expect(result.outputAmount).toBe('1000000000000000');
                    expect(result.expiration).toBeDefined();
                    expect(result.hashLock).toBeDefined();
                    expect(result.tokenAddress).toBeDefined();
                    expect(result.sender).toBeDefined();
                    expect(result.receiver).toBeDefined();
                    expect(result.outputNetwork).toBe('ETH');
                    expect(result.outputAddress).toBeDefined();
                    expect(result.transactionHash).toBeDefined();
                    expect(result.isSender).toBe(true);

                    contract.unsubscribe();

                    done();
                }, getFilter(ADDRESS));
            },
            15 * 60 * 1000
        );
    });
};
