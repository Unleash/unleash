import EventEmitter from 'events';
import { RepositoryInterface } from 'unleash-client/lib/repository';
import { Segment } from 'unleash-client/lib/strategy/strategy';
import { FeatureInterface } from 'unleash-client/lib/feature';
import ApiUser from '../types/api-user';
import { IUnleashConfig, IUnleashServices, IUnleashStores } from '../types';
import {
    mapFeaturesForClient,
    mapSegmentsForClient,
} from '../util/offline-unleash-client';
import { ALL_ENVS, ALL_PROJECTS } from '../util/constants';
import { UnleashEvents } from 'unleash-client';
import { ANY_EVENT } from '../util/anyEventEmitter';
import { Logger } from '../logger';

type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi'>;

type Stores = Pick<IUnleashStores, 'projectStore' | 'eventStore'>;

type Services = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'segmentService'
>;

export class ProxyRepository
    extends EventEmitter
    implements RepositoryInterface
{
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly stores: Stores;

    private readonly services: Services;

    private readonly token: ApiUser;

    private features: FeatureInterface[];

    private segments: Segment[];

    private interval: number;

    private timer: NodeJS.Timer;

    constructor(
        config: Config,
        stores: Stores,
        services: Services,
        token: ApiUser,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('proxy-repository.ts');
        this.stores = stores;
        this.services = services;
        this.token = token;
        this.onAnyEvent = this.onAnyEvent.bind(this);
        this.interval = config.frontendApi.refreshIntervalInMs;
    }

    getSegment(id: number): Segment | undefined {
        return this.segments.find((segment) => segment.id === id);
    }

    getToggle(name: string): FeatureInterface {
        return this.features.find((feature) => feature.name === name);
    }

    getToggles(): FeatureInterface[] {
        return this.features;
    }

    async start(): Promise<void> {
        await this.loadDataForToken();

        // Reload cached token data whenever something relevant has changed.
        // For now, simply reload all the data on any EventStore event.
        this.stores.eventStore.on(ANY_EVENT, this.onAnyEvent);

        this.emit(UnleashEvents.Ready);
        this.emit(UnleashEvents.Changed);
    }

    stop(): void {
        this.stores.eventStore.off(ANY_EVENT, this.onAnyEvent);
        clearTimeout(this.timer);
    }

    private async loadDataForToken() {
        this.timer = setTimeout(async () => {
            await this.loadDataForToken();
        }, this.randomizeDelay(this.interval, this.interval * 2)).unref();

        try {
            this.features = await this.featuresForToken();
            this.segments = await this.segmentsForToken();
        } catch (e) {
            this.logger.error(e);
        }
    }

    private randomizeDelay(floor: number, ceiling: number): number {
        return Math.floor(Math.random() * (ceiling - floor) + floor);
    }

    private async onAnyEvent() {
        try {
            await this.loadDataForToken();
        } catch (error) {
            this.logger.error(error);
        }
    }

    private async featuresForToken(): Promise<FeatureInterface[]> {
        return mapFeaturesForClient(
            await this.services.featureToggleServiceV2.getClientFeatures({
                project: await this.projectIdsForToken(),
                environment: this.environmentNameForToken(),
            }),
        );
    }

    private async segmentsForToken(): Promise<Segment[]> {
        return mapSegmentsForClient(
            await this.services.segmentService.getAll(),
        );
    }

    private async projectIdsForToken(): Promise<string[]> {
        if (this.token.projects.includes(ALL_PROJECTS)) {
            const allProjects = await this.stores.projectStore.getAll();
            return allProjects.map((project) => project.id);
        }

        return this.token.projects;
    }

    private environmentNameForToken(): string {
        if (this.token.environment === ALL_ENVS) {
            return 'default';
        }

        return this.token.environment;
    }
}
