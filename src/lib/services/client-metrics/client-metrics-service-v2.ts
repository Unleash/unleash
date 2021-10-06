import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import { IUnleashStores } from '../../types';
import { IClientApp } from '../../types/model';
import { GroupedClientMetrics } from '../../types/models/metrics';
import {
    IClientMetricsEnv,
    IClientMetricsStoreV2,
} from '../../types/stores/client-metrics-store-v2';
import { clientMetricsSchema } from './client-metrics-schema';
import { groupMetricsOnEnv } from './util';

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

    async getClientMetricsForToggle(
        toggleName: string,
    ): Promise<GroupedClientMetrics[]> {
        const metrics =
            await this.clientMetricsStoreV2.getMetricsForFeatureToggle(
                toggleName,
            );

        return groupMetricsOnEnv(metrics);
    }
}
