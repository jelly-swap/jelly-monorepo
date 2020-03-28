import { Contract, Adapter } from '../src';

import { getConfig, getFilter, ADDRESS, getProvider, generateSecret, wait } from './utils';

export default () => {
    const config = getConfig(600);
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

    describe('Withdraw', () => {
        let swapEventResult: any;

        it(
            'should broadcast new swap transaction',
            async () => {
                await wait(2);

                const input = adapter.formatInput(swap, receiver);

                const result = await contract.newContract(input, true);

                expect(result).toBeDefined();
            },
            5 * 60 * 1000
        );

        it(
            'should receive swap event',
            async done => {
                contract.subscribe((result: any) => {
                    swapEventResult = result;

                    contract.unsubscribe();

                    done();
                }, getFilter(ADDRESS));
            },
            15 * 60 * 1000
        );

        it(
            'should broadcast withdraw',
            async () => {
                const withdrawData = {
                    id: swapEventResult.id,
                    tokenAddress: swapEventResult.tokenAddress,
                    secret: generateSecret(swap.secret),
                };

                const result = await contract.withdraw(withdrawData);

                expect(result).toBeDefined();

                console.log('WITHDRAW TX HASH: ', result);
            },
            5 * 60 * 1000
        );

        it(
            'should receive withdraw event',
            async done => {
                contract.subscribe((result: any) => {
                    console.log('WITHDRAW EVENT: ', result);

                    expect(result.eventName).toBe('WITHDRAW');
                    expect(result.network).toBe('DAI');
                    expect(result.id).toBe(swapEventResult.id);
                    expect(result.secret).toBeDefined();
                    expect(result.hashLock).toBeDefined();
                    expect(result.tokenAddress).toBeDefined();
                    expect(result.sender).toBeDefined();
                    expect(result.receiver).toBeDefined();
                    expect(result.transactionHash).toBeDefined();

                    contract.unsubscribe();

                    done();
                }, getFilter(ADDRESS));
            },
            15 * 60 * 1000
        );
    });
};
