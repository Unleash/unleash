import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/index.js';
import type { IClientMetricsEnv } from '../client-metrics/client-metrics-store-v2-type.js';
import type { ILastSeenStore } from './types/last-seen-store-type.js';
import type { IUnleashStores } from '../../../types/index.js';

export type LastSeenInput = {
    featureName: string;
    environment: string;
};

export class LastSeenService {
    private lastSeenToggles: Map<String, LastSeenInput> = new Map();

    private logger: Logger;

    private lastSeenStore: ILastSeenStore;

    constructor(
        { lastSeenStore }: Pick<IUnleashStores, 'lastSeenStore'>,
        config: IUnleashConfig,
    ) {
        this.lastSeenStore = lastSeenStore;
        this.logger = config.getLogger(
            '/services/client-metrics/last-seen-service.ts',
        );
    }

    async store(): Promise<number> {
        const count = this.lastSeenToggles.size;
        if (count > 0) {
            const lastSeenToggles = Array.from(
                this.lastSeenToggles.values(),
            ).filter((lastSeen) => lastSeen.featureName.length <= 255);
            if (lastSeenToggles.length < this.lastSeenToggles.size) {
                this.logger.warn(
                    `Toggles with long names ${JSON.stringify(
                        Array.from(this.lastSeenToggles.values())
                            .filter(
                                (lastSeen) => lastSeen.featureName.length > 255,
                            )
                            .map((lastSeen) => lastSeen.featureName),
                    )}`,
                );
            }
            this.logger.debug(
                `Updating last seen for ${lastSeenToggles.length} toggles`,
            );
            this.lastSeenToggles = new Map<String, LastSeenInput>();

            await this.lastSeenStore.setLastSeen(lastSeenToggles);
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
            .forEach((clientMetric) => {
                const key = `${clientMetric.featureName}:${clientMetric.environment}`;
                this.lastSeenToggles.set(key, {
                    featureName: clientMetric.featureName,
                    environment: clientMetric.environment,
                });
            });
    }

    async cleanLastSeen() {
        await this.lastSeenStore.cleanLastSeen();
    }
}
