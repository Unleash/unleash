import { register as prometheusRegister } from 'prom-client';
import Controller from './controller';

class BackstageController extends Controller {
    logger: any;

    constructor(config) {
        super();

        this.logger = config.getLogger('backstage.js');

        if (config.serverMetrics) {
            this.get('/prometheus', async (req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);
                res.end(await prometheusRegister.metrics());
            });
        }
    }
}

export { BackstageController };
