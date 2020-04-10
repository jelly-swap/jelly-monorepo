import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import TransportWebBle from '@ledgerhq/hw-transport-web-ble';
import TransportU2F from '@ledgerhq/hw-transport-u2f';

export default class LedgerTransport {
    private app: any;
    private config: { webble: boolean; u2f: boolean };

    private transportType: any;
    private transport: any;
    private ledgerInstance: any;

    constructor(app: any, config = { webble: false, u2f: false }) {
        this.app = app;
        this.config = config;
        this.transportType = this.getTransportType();
    }

    getTransportType() {
        if (this.config.u2f) {
            return TransportU2F;
        }

        if (this.config.webble) {
            return TransportWebBle;
        }

        return TransportWebUsb;
    }

    async isSupported() {
        return this.transportType.isSupported();
    }

    async createTransport() {
        if (!this.transport) {
            this.transport = await this.transportType.create();

            this.transport.on('disconnect', () => {
                this.ledgerInstance = null;
                this.transport = null;
            });
        }
    }

    async getInstance() {
        try {
            await this.createTransport();

            if (!this.ledgerInstance) {
                this.ledgerInstance = new this.app(this.transport);
            }

            return this.ledgerInstance;
        } catch (e) {}
    }
}
