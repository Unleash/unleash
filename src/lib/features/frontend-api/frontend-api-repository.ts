import EventEmitter from 'events';
import type { RepositoryInterface } from 'unleash-client/lib/repository/index.js';
import type { Segment } from 'unleash-client/lib/strategy/strategy.js';
import type {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature.js';
import type { IApiUser } from '../../types/api-user.js';
import type { IUnleashConfig } from '../../types/index.js';
import { UnleashEvents } from 'unleash-client';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache.js';

type Config = Pick<IUnleashConfig, 'getLogger'>;

export class FrontendApiRepository
    extends EventEmitter
    implements RepositoryInterface
{
    private readonly token: IApiUser;

    private globalFrontendApiCache: GlobalFrontendApiCache;

    private running: boolean;

    constructor(
        _config: Config,
        globalFrontendApiCache: GlobalFrontendApiCache,
        token: IApiUser,
    ) {
        super();
        this.token = token;
        this.globalFrontendApiCache = globalFrontendApiCache;
    }

    getTogglesWithSegmentData(): EnhancedFeatureInterface[] {
        // TODO: add real implementation
        return [];
    }

    getSegment(id: number): Segment | undefined {
        return this.globalFrontendApiCache.getSegment(id);
    }

    getToggle(name: string): FeatureInterface {
        return this.globalFrontendApiCache.getToggle(name, this.token);
    }

    getToggles(): FeatureInterface[] {
        return this.globalFrontendApiCache.getToggles(this.token);
    }

    async start(): Promise<void> {
        if (!this.running) {
            this.running = true;

            this.emit(UnleashEvents.Ready);
            this.emit(UnleashEvents.Changed);
        }
    }

    stop(): void {
        this.running = false;
    }
}
