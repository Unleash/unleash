import EventEmitter from 'events';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type { FeatureInterface } from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type {
    IFeatureToggleClient,
    ISegmentReadModel,
    IUnleashConfig,
} from '../../types';
import {
    mapFeatureForClient,
    mapSegmentsForClient,
} from '../playground/offline-unleash-client';
import { ALL_ENVS } from '../../util/constants';
import type { Logger } from '../../logger';
import { UPDATE_REVISION } from '../feature-toggle/configuration-revision-service';
import metricsHelper from '../../util/metrics-helper';
import { FUNCTION_TIME } from '../../metric-events';
import type { IClientFeatureToggleReadModel } from '../frontend-api/client-feature-toggle-read-model-type';

type Config = Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>;

type FrontendApiFeatureCache = Record<string, Record<string, FeatureInterface>>;

export type GlobalFrontendApiCacheState = 'starting' | 'ready' | 'updated';

export class ClientFeatureToggleCache extends EventEmitter {
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly clientFeatureToggleReadModel: IClientFeatureToggleReadModel;

    private readonly segmentReadModel: ISegmentReadModel;

    private readonly configurationRevisionService: EventEmitter;

    private featuresByEnvironment: FrontendApiFeatureCache = {};

    private segments: Segment[] = [];

    private status: GlobalFrontendApiCacheState = 'starting';

    private timer: Function;

    constructor(
        config: Config,
        segmentReadModel: ISegmentReadModel,
        clientFeatureToggleReadModel: IClientFeatureToggleReadModel,
        configurationRevisionService: EventEmitter,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('client-feature-toggle-cache.ts');
        this.clientFeatureToggleReadModel = clientFeatureToggleReadModel;
        this.configurationRevisionService = configurationRevisionService;
        this.segmentReadModel = segmentReadModel;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.timer = (functionName) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'GlobalFrontendApiCache',
                functionName,
            });

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

    public async refreshData() {
        // parameter is revision id
        // pull only new events sorted by revision
        // iterate the events
        // find the relevant feature
        // ex1 : feature-dependency-added - update dependency array for that feature
        // ex2
        // try {
        //     this.featuresByEnvironment = await this.getAllFeatures();
        //     this.segments = await this.getAllSegments();
        //     if (this.status === 'starting') {
        //         this.status = 'ready';
        //         this.emit('ready');
        //     } else if (this.status === 'ready' || this.status === 'updated') {
        //         this.status = 'updated';
        //         this.emit('updated');
        //     }
        // } catch (e) {
        //     this.logger.error('Cannot load data for token', e);
        // }
    }

    private async getAllFeatures(): Promise<FrontendApiFeatureCache> {
        const features = await this.clientFeatureToggleReadModel.getAll();
        return this.mapFeatures(features);
    }

    private async getAllSegments(): Promise<Segment[]> {
        return mapSegmentsForClient(await this.segmentReadModel.getAll());
    }

    // event id 50, every second, we read, and if we see 51 ( 1 db call)
    // emit revision event
    // our cache listens to event
    // now i need to get my data ( 1 db call)

    private async onUpdateRevisionEvent() {
        await this.refreshData();
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
