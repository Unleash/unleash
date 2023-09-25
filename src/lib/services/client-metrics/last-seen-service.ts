import { secondsToMilliseconds } from 'date-fns';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import { IUnleashStores } from '../../types';
import { IClientMetricsEnv } from '../../types/stores/client-metrics-store-v2';
import { IFeatureToggleStore } from '../../types/stores/feature-toggle-store';

export type LastSeenInput = {
    featureName: string;
    environment: string;
};

export class LastSeenService {
    private timers: NodeJS.Timeout[] = [];

    private lastSeenToggles: Map<String, LastSeenInput> = new Map();

    private logger: Logger;

    private featureToggleStore: IFeatureToggleStore;

    constructor(
        { featureToggleStore }: Pick<IUnleashStores, 'featureToggleStore'>,
        config: IUnleashConfig,
        lastSeenInterval = secondsToMilliseconds(30),
    ) {
        this.featureToggleStore = featureToggleStore;
        this.logger = config.getLogger(
            '/services/client-metrics/last-seen-service.ts',
        );

        this.timers.push(
            setInterval(() => this.store(), lastSeenInterval).unref(),
        );
    }

    async store(): Promise<number> {
        const count = this.lastSeenToggles.size;
        if (count > 0) {
            const lastSeenToggles = Array.from(this.lastSeenToggles.values());
            this.lastSeenToggles = new Map<String, LastSeenInput>();
            this.logger.debug(
                `Updating last seen for ${lastSeenToggles.length} toggles`,
            );
            await this.featureToggleStore.setLastSeen(lastSeenToggles);
        }
        return count;
    }

    updateLastSeen(clientMetrics: IClientMetricsEnv[]): void {
        clientMetrics
            .filter(
                (clientMetric) =>
                    !this.lastSeenToggles.has(
                        `${clientMetric.featureName}:${clientMetric.environment}`,
                    ),
            )
            .filter(
                (clientMetric) => clientMetric.yes > 0 || clientMetric.no > 0,
            )
            .forEach(async (clientMetric) => {
                const key = `${clientMetric.featureName}:${clientMetric.environment}`;
                this.lastSeenToggles.set(key, {
                    featureName: clientMetric.featureName,
                    environment: clientMetric.environment,
                });
            });
    }

    destroy(): void {
        this.timers.forEach(clearInterval);
    }
}
