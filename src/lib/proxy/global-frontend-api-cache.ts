import EventEmitter from 'events';
import { Segment } from 'unleash-client/lib/strategy/strategy';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { IApiUser } from '../types/api-user';
import {
    IFeatureToggleClient,
    ISegmentReadModel,
    IUnleashConfig,
} from '../types';
import {
    mapFeatureForClient,
    mapSegmentsForClient,
} from '../features/playground/offline-unleash-client';
import { ALL_ENVS } from '../util/constants';
import { Logger } from '../logger';
import { UPDATE_REVISION } from '../features/feature-toggle/configuration-revision-service';
import { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type';

type Config = Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>;

type FrontendApiFeatureCache = Record<string, Record<string, FeatureInterface>>;

export type GlobalFrontendApiCacheState = 'starting' | 'ready' | 'updated';

export class GlobalFrontendApiCache extends EventEmitter {
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly clientFeatureToggleReadModel: IClientFeatureToggleReadModel;

    private readonly segmentReadModel: ISegmentReadModel;

    private readonly configurationRevisionService: EventEmitter;

    private featuresByEnvironment: FrontendApiFeatureCache = {};

    private segments: Segment[] = [];

    private status: GlobalFrontendApiCacheState = 'starting';

    constructor(
        config: Config,
        segmentReadModel: ISegmentReadModel,
        clientFeatureToggleReadModel: IClientFeatureToggleReadModel,
        configurationRevisionService: EventEmitter,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('proxy-repository.ts');
        this.clientFeatureToggleReadModel = clientFeatureToggleReadModel;
        this.configurationRevisionService = configurationRevisionService;
        this.segmentReadModel = segmentReadModel;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.refreshData();
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
    }

    getSegment(id: number): Segment | undefined {
        return this.segments.find((segment) => segment.id === id);
    }

    getToggle(name: string, token: IApiUser): FeatureInterface {
        const features = this.getTogglesByEnvironment(
            this.environmentNameForToken(token),
        );
        return features[name];
    }

    getToggles(token: IApiUser): FeatureInterface[] {
        const features = this.getTogglesByEnvironment(
            this.environmentNameForToken(token),
        );
        return this.filterTogglesByProjects(features, token.projects);
    }

    private filterTogglesByProjects(
        features: Record<string, FeatureInterface>,
        projects: string[],
    ): FeatureInterface[] {
        if (projects.includes('*')) {
            return Object.values(features);
        }
        return Object.values(features).filter(
            (feature) => feature.project && projects.includes(feature.project),
        );
    }

    private getTogglesByEnvironment(
        environment: string,
    ): Record<string, FeatureInterface> {
        const features = this.featuresByEnvironment[environment];

        if (features == null) return {};

        return features;
    }

    // TODO: fetch only relevant projects/environments based on tokens
    // TODO: also consider not fetching disabled features, because those are not returned by frontend API
    private async refreshData() {
        try {
            this.featuresByEnvironment = await this.getAllFeatures();
            this.segments = await this.getAllSegments();
            if (this.status === 'starting') {
                this.status = 'ready';
                this.emit('ready');
            } else if (this.status === 'ready' || this.status === 'updated') {
                this.status = 'updated';
                this.emit('updated');
            }
        } catch (e) {
            this.logger.error('Cannot load data for token', e);
        }
    }

    private async getAllFeatures(): Promise<FrontendApiFeatureCache> {
        const features = await this.clientFeatureToggleReadModel.getClient();
        return this.mapFeatures(features);
    }

    private async getAllSegments(): Promise<Segment[]> {
        return mapSegmentsForClient(await this.segmentReadModel.getAll());
    }

    private async onUpdateRevisionEvent() {
        if (this.config.flagResolver.isEnabled('globalFrontendApiCache')) {
            await this.refreshData();
        }
    }

    private environmentNameForToken(token: IApiUser): string {
        if (token.environment === ALL_ENVS) {
            return 'default';
        }
        return token.environment;
    }

    private mapFeatures(
        features: Record<string, Record<string, IFeatureToggleClient>>,
    ): FrontendApiFeatureCache {
        const entries = Object.entries(features).map(([key, value]) => [
            key,
            Object.fromEntries(
                Object.entries(value).map(([innerKey, innerValue]) => [
                    innerKey,
                    mapFeatureForClient(innerValue),
                ]),
            ),
        ]);

        return Object.fromEntries(entries);
    }
}
