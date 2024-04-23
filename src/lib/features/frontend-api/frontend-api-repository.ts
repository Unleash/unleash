import EventEmitter from 'events';
import type { RepositoryInterface } from 'unleash-client/lib/repository';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type { IUnleashConfig } from '../../types';
import { UnleashEvents } from 'unleash-client';
import type { Logger } from '../../logger';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache';

type Config = Pick<IUnleashConfig, 'getLogger'>;

export class FrontendApiRepository
    extends EventEmitter
    implements RepositoryInterface
{
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly token: IApiUser;

    private globalFrontendApiCache: GlobalFrontendApiCache;

    private running: boolean;

    constructor(
        config: Config,
        globalFrontendApiCache: GlobalFrontendApiCache,
        token: IApiUser,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('frontend-api-repository.ts');
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
        this.running = true;

        this.emit(UnleashEvents.Ready);
        this.emit(UnleashEvents.Changed);
    }

    stop(): void {
        this.running = false;
    }
}
