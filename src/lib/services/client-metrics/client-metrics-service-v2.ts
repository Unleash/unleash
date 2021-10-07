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

const FIVE_MINUTES = 5 * 60 * 1000;

export default class ClientMetricsServiceV2 {
    private timers: NodeJS.Timeout[] = [];

    private clientMetricsStoreV2: IClientMetricsStoreV2;

    private logger: Logger;

    private bulkInterval: number;

    constructor(
        { clientMetricsStoreV2 }: Pick<IUnleashStores, 'clientMetricsStoreV2'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        bulkInterval = FIVE_MINUTES,
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;

        this.logger = getLogger('/services/client-metrics/index.ts');

        this.bulkInterval = bulkInterval;
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

        // TODO: should we aggregate for a few minutes (bulkInterval) before pushing to DB?
        await this.clientMetricsStoreV2.batchInsertMetrics(clientMetrics);
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
}
