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
import { GlobalFrontendApiRepository } from './global-frontend-api-repository';

type Config = Pick<IUnleashConfig, 'getLogger'>;

export class FrontendApiRepository
    extends EventEmitter
    implements RepositoryInterface
{
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly token: IApiUser;

    private globalFrontendApiRepository: GlobalFrontendApiRepository;

    private running: boolean;

    constructor(
        config: Config,
        globalFrontendApiRepository: GlobalFrontendApiRepository,
        token: IApiUser,
    ) {
        super();
        this.config = config;
        this.logger = config.getLogger('frontend-api-repository.ts');
        this.token = token;
        this.globalFrontendApiRepository = globalFrontendApiRepository;
    }

    getTogglesWithSegmentData(): EnhancedFeatureInterface[] {
        // TODO: add real implementation
        return [];
    }

    getSegment(id: number): Segment | undefined {
        return this.globalFrontendApiRepository.getSegment(id);
    }

    getToggle(name: string): FeatureInterface {
        //@ts-ignore (we must update the node SDK to allow undefined)
        return this.globalFrontendApiRepository
            .getToggles(this.token)
            .find((feature) => feature.name);
    }

    getToggles(): FeatureInterface[] {
        return this.globalFrontendApiRepository.getToggles(this.token);
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
