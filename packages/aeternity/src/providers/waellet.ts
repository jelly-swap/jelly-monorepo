import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';

export default async (onSuccess: Function) => {
    const scanner = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
    });

    await Detector({ connection: scanner }).then((detector: any) => {
        detector.scan(async (result: any) => {
            detector.stopScan();
            onSuccess(result);
        });
    });
};
