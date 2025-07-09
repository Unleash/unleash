import type EventEmitter from 'events';
import {
    FEATURE_ENVIRONMENT_ENABLED,
    CLIENT_METRICS,
} from '../events/index.js';
import type { Logger } from '../logger.js';
import type {
    IFlagResolver,
    IUnleashConfig,
    IEventStore,
    IEnvironmentStore,
} from '../types/index.js';
import type VersionService from './version-service.js';

type FlagEnabledEvent = {
    email: string;
    client_id: string;
    date: string;
    project: string;
    environment_type: string;
};

type SdkConnectedEvent = {
    client_id: string;
    date: string;
    sdk: string; // the same thing we report via the unleash-sdk header, e.g. unleash-client-js:1.0.0
    app_name: string;
};

export class FeatureLifecycleService {
    private eventStore: IEventStore;

    private flagResolver: IFlagResolver;

    private environmentStore: IEnvironmentStore;

    private eventBus: EventEmitter;

    private versionService: VersionService;

    private logger: Logger;

    constructor(
        {
            eventStore,
            environmentStore,
        }: {
            eventStore: IEventStore;
            environmentStore: IEnvironmentStore;
        },

        {
            versionService,
        }: {
            versionService: VersionService;
        },
        {
            flagResolver,
            eventBus,
            getLogger,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>,
    ) {
        this.eventStore = eventStore;
        this.environmentStore = environmentStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.versionService = versionService;
        this.logger = getLogger(
            'feature-lifecycle/feature-lifecycle-service.ts',
        );
    }

    listen() {
        this.eventStore.on(FEATURE_ENVIRONMENT_ENABLED, async (event) => {
            // @ts-expect-error
            if (this.flagResolver.isEnabled('paygTrialEvents')) {
                const envName = event.environment;
                const environment = await this.environmentStore.get(envName);

                const environmentType =
                    environment?.type || `Unknown type. Name was ${envName}.`;

                const instanceId = await this.versionService.getInstanceId();

                const hsEvent: FlagEnabledEvent = {
                    email: event.createdBy,
                    client_id: instanceId ?? 'No instance ID',
                    date: event.createdAt,
                    project: event.project,
                    environment_type: environmentType,
                };
            }
        });
        this.eventBus.on(
            CLIENT_METRICS, // or CLIENT_METRICS_ADDED? 🤷
            async (event) => {
                // @ts-expect-error
                if (this.flagResolver.isEnabled('paygTrialEvents')) {
                    // todo: report to HS
                }
            },
        );
    }
}
