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
} from '../types/index.js';

export class FeatureLifecycleService {
    private eventStore: IEventStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private logger: Logger;

    constructor(
        {
            eventStore,
        }: {
            eventStore: IEventStore;
        },
        {
            flagResolver,
            eventBus,
            getLogger,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>,
    ) {
        this.eventStore = eventStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.logger = getLogger(
            'feature-lifecycle/feature-lifecycle-service.ts',
        );
    }

    listen() {
        this.eventStore.on(FEATURE_ENVIRONMENT_ENABLED, async (event) => {
            if (this.flagResolver.isEnabled('paygTrialEvents')) {
                // report to HS
            }
        });
        this.eventBus.on(
            CLIENT_METRICS, // or CLIENT_METRICS_ADDED? 🤷
            async (event) => {
                if (this.flagResolver.isEnabled('paygTrialEvents')) {
                    // todo: report to HS
                }
            },
        );
    }
}
