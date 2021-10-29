import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import { IUnleashStores } from '../../types';
import { IClientApp } from '../../types/model';
import { ToggleMetricsSummary } from '../../types/models/metrics';
import {
    IClientMetricsEnv,
    IClientMetricsStoreV2,
} from '../../types/stores/client-metrics-store-v2';
import { clientMetricsSchema } from './client-metrics-schema';

const DEFAULT_BULK_INTERVAL = 30 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export default class ClientMetricsServiceV2 {
    private timer: NodeJS.Timeout;

    private bulkTimer: NodeJS.Timeout;

    private clientMetricsStoreV2: IClientMetricsStoreV2;

    private logger: Logger;

    private unsavedMetics: IClientMetricsEnv[] = [];

    constructor(
        { clientMetricsStoreV2 }: Pick<IUnleashStores, 'clientMetricsStoreV2'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        bulkInterval = DEFAULT_BULK_INTERVAL,
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;

        this.logger = getLogger('/services/client-metrics/index.ts');

        this.timer = setInterval(() => {
            this.clientMetricsStoreV2.clearMetrics(48);
        }, ONE_DAY);
        this.timer.unref();

        this.bulkTimer = setInterval(async () => {
            await this.saveMetrics();
        }, bulkInterval);
        this.bulkTimer.unref();
    }

    async registerClientMetrics(
        data: IClientApp,
        clientIp: string,
    ): Promise<void> {
        const value = await clientMetricsSchema.validateAsync(data);
        const toggleNames = Object.keys(value.bucket.toggles);

        this.logger.debug(`got metrics from ${clientIp}`);

        const clientMetrics: IClientMetricsEnv[] = toggleNames
            .map((name) => ({
                featureName: name,
                appName: value.appName,
                environment: value.environment,
                timestamp: value.bucket.start, //we might need to approximate between start/stop...
                yes: value.bucket.toggles[name].yes,
                no: value.bucket.toggles[name].no,
            }))
            .filter((item) => !(item.yes === 0 && item.no === 0));

        this.unsavedMetics = this.unsavedMetics.concat(clientMetrics);
    }

    async saveMetrics(): Promise<void> {
        if (this.unsavedMetics.length === 0) {
            return;
        }
        const metrics = this.unsavedMetics;
        this.unsavedMetics = [];
        try {
            this.logger.debug('storing metrics');
            await this.clientMetricsStoreV2.batchInsertMetrics(metrics);
        } catch (error: any) {
            this.logger.error(error);
            this.unsavedMetics = this.unsavedMetics.concat(metrics);
        }
    }

    // Overview over usage last "hour" bucket and all applications using the toggle
    async getFeatureToggleMetricsSummary(
        featureName: string,
    ): Promise<ToggleMetricsSummary> {
        const metrics =
            await this.clientMetricsStoreV2.getMetricsForFeatureToggle(
                featureName,
                1,
            );
        const seenApplications =
            await this.clientMetricsStoreV2.getSeenAppsForFeatureToggle(
                featureName,
            );

        const groupedMetrics = metrics.reduce((prev, curr) => {
            if (prev[curr.environment]) {
                prev[curr.environment].yes += curr.yes;
                prev[curr.environment].no += curr.no;
            } else {
                prev[curr.environment] = {
                    environment: curr.environment,
                    timestamp: curr.timestamp,
                    yes: curr.yes,
                    no: curr.no,
                };
            }
            return prev;
        }, {});

        return {
            featureName,
            lastHourUsage: Object.values(groupedMetrics),
            seenApplications,
        };
    }

    async getClientMetricsForToggle(
        toggleName: string,
    ): Promise<IClientMetricsEnv[]> {
        return this.clientMetricsStoreV2.getMetricsForFeatureToggle(toggleName);
    }

    destroy(): void {
        clearInterval(this.timer);
        this.timer = null;
        clearInterval(this.bulkTimer);
        this.bulkTimer = null;
    }
}
