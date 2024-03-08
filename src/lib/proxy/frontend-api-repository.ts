import EventEmitter from 'events';
import { RepositoryInterface } from 'unleash-client/lib/repository';
import { Segment } from 'unleash-client/lib/strategy/strategy';
import {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature';
import { IApiUser } from '../types/api-user';
import { IUnleashConfig } from '../types';
import { UnleashEvents } from 'unleash-client';
import { Logger } from '../logger';
import { GlobalFrontendApiCache } from './global-frontend-api-cache';

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
        //@ts-ignore (we must update the node SDK to allow undefined)
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
