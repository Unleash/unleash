import { writeHeapSnapshot } from 'v8';
import { register as prometheusRegister } from 'prom-client';
import Controller from './controller';
import { IUnleashConfig } from '../types/option';

class BackstageController extends Controller {
    logger: any;

    constructor(config: IUnleashConfig) {
        super(config);

        this.logger = config.getLogger('backstage.js');

        if (config.server.serverMetrics) {
            this.get('/prometheus', async (req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);
                res.end(await prometheusRegister.metrics());
            });
        }

        if (config.server.enableHeapSnapshotEnpoint) {
            this.get('/heap-snapshot', async (req, res) => {
                writeHeapSnapshot();
                res.status(200);
                res.end('Snapshot written');
            });
        }
    }
}

export { BackstageController };
