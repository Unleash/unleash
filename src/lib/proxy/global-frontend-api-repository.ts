import EventEmitter from 'events';
import { Segment } from 'unleash-client/lib/strategy/strategy';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { IApiUser } from '../types/api-user';
import { IUnleashConfig, IUnleashServices, IUnleashStores } from '../types';
import {
    mapFeaturesForClient,
    mapSegmentsForClient,
} from '../features/playground/offline-unleash-client';
import { ALL_ENVS } from '../util/constants';
import { Logger } from '../logger';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service';

type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi' | 'eventBus'>;

type Stores = Pick<
    IUnleashStores,
    'projectStore' | 'eventStore' | 'segmentReadModel'
>;

type Services = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'configurationRevisionService'
>;

export class GlobalFrontendApiRepository extends EventEmitter {
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
    }

    getSegment(id: number): Segment | undefined {
        return this.segments.find((segment) => segment.id === id);
    }

    getToggles(token: IApiUser): FeatureInterface[] {
        return this.features;
    }

    private async getAllFeatures(): Promise<FeatureInterface[]> {
        const mappedFeatures = mapFeaturesForClient(
            // TODO: refactor into read model
            await this.services.featureToggleServiceV2.getClientFeatures(),
        );
        return mappedFeatures;
    }

    private async getAllSegments(): Promise<Segment[]> {
        return mapSegmentsForClient(
            await this.stores.segmentReadModel.getAll(),
        );
    }

    // TODO: fetch only relevant projects/environments based on tokens
    // TODO: also consider not fetching disabled features, because those are not returned by frontend API
    private async refreshData() {
        try {
            this.features = await this.getAllFeatures();
            this.segments = await this.getAllSegments();
        } catch (e) {
            this.logger.error('Cannot load data for token', e);
        }
    }

    private async onUpdateRevisionEvent() {
        await this.refreshData();
    }

    private environmentNameForToken(): string {
        if (this.token.environment === ALL_ENVS) {
            return 'default';
        }

        return this.token.environment;
    }
}
