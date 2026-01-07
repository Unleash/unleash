import { writeHeapSnapshot } from 'v8';
import { tmpdir } from 'os';
import { join } from 'path';
import { register as prometheusRegister } from 'prom-client';
import { impactRegister } from '../features/metrics/impact/impact-register.js';
import Controller from './controller.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IFlagResolver } from '../types/index.js';
import type { CustomMetricsService } from '../features/metrics/custom/custom-metrics-service.js';
import type { IUnleashServices } from '../services/index.js';

class BackstageController extends Controller {
    logger: any;
    private flagResolver: IFlagResolver;
    private customMetricsService: CustomMetricsService;

    constructor(
        config: IUnleashConfig,
        {
            customMetricsService,
        }: Pick<IUnleashServices, 'customMetricsService'>,
    ) {
        super(config);

        this.logger = config.getLogger('backstage.js');
        this.flagResolver = config.flagResolver;
        this.customMetricsService = customMetricsService;

        if (config.server.serverMetrics) {
            this.get('/prometheus', async (_req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);

                let metricsOutput = await prometheusRegister.metrics();

                if (this.flagResolver.isEnabled('customMetrics')) {
                    const customMetrics =
                        this.customMetricsService.getPrometheusMetrics();
                    if (customMetrics) {
                        metricsOutput = `${metricsOutput}\n${customMetrics}`;
                    }
                }

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
