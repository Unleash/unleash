import type { Logger } from '../../logger.js';
import type {
    EnvironmentRevisionId,
    IEventStore,
    IFlagResolver,
    IUnleashConfig,
    IUnleashStores,
} from '../../types/index.js';
import EventEmitter from 'events';
import { createGauge } from '../../util/metrics/index.js';

export const UPDATE_REVISION = 'UPDATE_REVISION';

const revisionIdMetric = createGauge({
    name: 'environment_revision_id',
    help: 'Current revision id for environment',
    labelNames: ['environment'],
});

export default class ConfigurationRevisionService extends EventEmitter {
    private static instance: ConfigurationRevisionService | undefined;

    private logger: Logger;

    private eventStore: IEventStore;

    private revisionId: number;

    private maxRevisionId: Map<string, number> = new Map();

    private flagResolver: IFlagResolver;

    private constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        super();
        this.logger = getLogger('configuration-revision-service.ts');
        this.eventStore = eventStore;
        this.flagResolver = flagResolver;
        this.revisionId = 0;
    }

    static getInstance(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        if (!ConfigurationRevisionService.instance) {
            ConfigurationRevisionService.instance =
                new ConfigurationRevisionService(
                    { eventStore },
                    { getLogger, flagResolver },
                );
        }
        return ConfigurationRevisionService.instance;
    }
    // Used in enterprise to give edge observability data
    getCachedRevisionIdsPerEnvironment(): EnvironmentRevisionId[] {
        return Array.from(this.maxRevisionId.entries()).map(
            ([environment, revisionId]) => {
                return {
                    environment,
                    revisionId,
                };
            },
        );
    }

    async getMaxRevisionId(environment?: string): Promise<number> {
        if (environment) {
            let maxEnvRevisionId = this.maxRevisionId.get(environment) ?? 0;
            if (maxEnvRevisionId === 0) {
                maxEnvRevisionId =
                    await this.updateMaxEnvironmentRevisionId(environment);
            }
            if (maxEnvRevisionId > 0) {
                return maxEnvRevisionId;
            }
        }
        if (this.revisionId > 0) {
            return this.revisionId;
        } else {
            return this.updateMaxRevisionId();
        }
    }

    async updateMaxEnvironmentRevisionId(environment: string): Promise<number> {
        let maxRevId = this.maxRevisionId.get(environment) ?? 0;
        const actualMax = await this.eventStore.getMaxRevisionId(
            maxRevId,
            environment,
        );
        if (maxRevId < actualMax) {
            this.maxRevisionId.set(environment, actualMax);
            maxRevId = actualMax;
        }
        revisionIdMetric.labels({ environment }).set(maxRevId);
        return maxRevId;
    }

    async updateMaxRevisionId(emit: boolean = true): Promise<number> {
        if (this.flagResolver.isEnabled('disableUpdateMaxRevisionId')) {
            return 0;
        }

        const revisionId = await this.eventStore.getMaxRevisionId(
            this.revisionId,
        );
        if (this.revisionId !== revisionId) {
            const knownEnvironments = [...this.maxRevisionId.keys()];
            this.logger.debug(
                `Updating feature configuration with new revision Id ${revisionId} and all envs: ${knownEnvironments.join(', ')}`,
            );
            await Promise.allSettled(
                knownEnvironments.map((environment) =>
                    this.updateMaxEnvironmentRevisionId(environment),
                ),
            );
            this.revisionId = revisionId;
            if (emit) {
                this.emit(UPDATE_REVISION, revisionId);
            }
        }

        return this.revisionId;
    }

    destroy(): void {
        ConfigurationRevisionService.instance?.removeAllListeners();
        ConfigurationRevisionService.instance = undefined;
    }
}
