import { writeHeapSnapshot } from 'v8';
import { tmpdir } from 'os';
import { join } from 'path';
import { register as prometheusRegister } from 'prom-client';
import { impactRegister } from '../features/metrics/impact/impact-register.js';
import Controller from './controller.js';
import type { IUnleashConfig } from '../types/option.js';

class BackstageController extends Controller {
    logger: any;

    constructor(config: IUnleashConfig) {
        super(config);

        this.logger = config.getLogger('backstage.js');

        if (config.server.serverMetrics) {
            this.get('/prometheus', async (_req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);

                const metricsOutput = await prometheusRegister.metrics();

                res.end(metricsOutput);
            });

            this.get('/impact/metrics', async (_req, res) => {
                res.set('Content-Type', impactRegister.contentType);

                const metricsOutput = await impactRegister.metrics();

                res.end(metricsOutput);
            });
        }

        if (config.server.enableHeapSnapshotEnpoint) {
            this.get('/heap-snapshot', async (_req, res) => {
                const fileName = join(
                    tmpdir(),
                    `unleash-${Date.now()}.heapsnapshot`,
                );
                writeHeapSnapshot(fileName);
                res.status(200);
                res.end('Snapshot written');
            });
        }
    }
}

export { BackstageController };
