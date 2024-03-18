import EventEmitter from 'events';
import type { RepositoryInterface } from 'unleash-client/lib/repository';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type {
    IUnleashConfig,
    IUnleashServices,
    IUnleashStores,
} from '../../types';
import {
    mapFeaturesForClient,
    mapSegmentsForClient,
} from '../playground/offline-unleash-client';
import { ALL_ENVS } from '../../util/constants';
import { UnleashEvents } from 'unleash-client';
import type { Logger } from '../../logger';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../feature-toggle/configuration-revision-service';
import {
    FUNCTION_TIME,
    PROXY_FEATURES_FOR_TOKEN_TIME,
} from '../../metric-events';
import metricsHelper from '../../util/metrics-helper';

type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi' | 'eventBus'>;

type Stores = Pick<IUnleashStores, 'segmentReadModel'>;

type Services = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'configurationRevisionService'
>;

// TODO: remove after finished migration to global frontend api cache
export class ProxyRepository
    extends EventEmitter
    implements RepositoryInterface
{
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly stores: Stores;

    private readonly services: Services;

    private readonly configurationRevisionService: ConfigurationRevisionService;

    private readonly token: IApiUser;

    private features: FeatureInterface[];

    private segments: Segment[];

    private interval: number;

    private timer: NodeJS.Timeout | null;

    private running: boolean;

    private methodTimer: Function;

    constructor(
        config: Config,
        stores: Stores,
        services: Services,
        token: IApiUser,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('proxy-repository.ts');
        this.stores = stores;
        this.services = services;
        this.configurationRevisionService =
            services.configurationRevisionService;
        this.token = token;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.interval = config.frontendApi.refreshIntervalInMs;

        this.methodTimer = (functionName) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'ProxyRepository',
                functionName,
            });
    }

    getTogglesWithSegmentData(): EnhancedFeatureInterface[] {
        // TODO: add real implementation
        return [];
    }

    getSegment(id: number): Segment | undefined {
        return this.segments.find((segment) => segment.id === id);
    }

    getToggle(name: string): FeatureInterface {
        //@ts-ignore (we must update the node SDK to allow undefined)
        return this.features.find((feature) => feature.name === name);
    }

    getToggles(): FeatureInterface[] {
        return this.features;
    }

    async start(): Promise<void> {
        this.running = true;
        await this.dataPolling();

        // Reload cached token data whenever something relevant has changed.
        // For now, simply reload all the data on any EventStore event.
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );

        this.emit(UnleashEvents.Ready);
        this.emit(UnleashEvents.Changed);
    }

    stop(): void {
        this.configurationRevisionService.off(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
        this.running = false;
    }

    private async dataPolling() {
        this.timer = setTimeout(
            async () => {
                if (!this.running) {
                    clearTimeout(this.timer!);
                    this.timer = null;
                    this.logger.debug(
                        'Shutting down data polling for proxy repository',
                    );
                    return;
                }
                await this.dataPolling();
            },
            this.randomizeDelay(this.interval, this.interval * 2),
        ).unref();

        await this.loadDataForToken();
    }

    private async loadDataForToken() {
        try {
            const stopTimer = this.methodTimer('loadDataForToken');
            this.features = await this.featuresForToken();
            this.segments = await this.segmentsForToken();
            stopTimer();
        } catch (e) {
            this.logger.error('Cannot load data for token', e);
        }
    }

    private randomizeDelay(floor: number, ceiling: number): number {
        return Math.floor(Math.random() * (ceiling - floor) + floor);
    }

    private async onUpdateRevisionEvent() {
        await this.loadDataForToken();
    }

    private async featuresForToken(): Promise<FeatureInterface[]> {
        const start = Date.now();
        const mappedFeatures = await mapFeaturesForClient(
            await this.services.featureToggleServiceV2.getClientFeatures({
                project: this.token.projects,
                environment: this.environmentNameForToken(),
            }),
        );
        const duration = (Date.now() - start) / 1000;
        this.config.eventBus.emit(PROXY_FEATURES_FOR_TOKEN_TIME, { duration });
        return mappedFeatures;
    }

    private async segmentsForToken(): Promise<Segment[]> {
        return mapSegmentsForClient(
            await this.stores.segmentReadModel.getAll(),
        );
    }

    private environmentNameForToken(): string {
        if (this.token.environment === ALL_ENVS) {
            return 'default';
        }

        return this.token.environment;
    }
}
