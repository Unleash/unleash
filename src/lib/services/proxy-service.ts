import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { IUnleashServices, IUnleashStores } from '../types';
import { ProxyFeatureSchema } from '../openapi/spec/proxy-feature-schema';
import { IProjectStore } from '../types/stores/project-store';
import FeatureToggleService from './feature-toggle-service';
import { SegmentService } from './segment-service';
import ApiUser from '../types/api-user';

export class ProxyService {
    private readonly logger: Logger;

    private projectStore: IProjectStore;

    private featureToggleService: FeatureToggleService;

    private segmentService: SegmentService;

    constructor(
        config: Pick<IUnleashConfig, 'getLogger'>,
        { projectStore }: Pick<IUnleashStores, 'projectStore'>,
        {
            featureToggleService,
            segmentService,
        }: Pick<IUnleashServices, 'featureToggleService' | 'segmentService'>,
    ) {
        this.logger = config.getLogger('services/proxy-service.ts');
        this.projectStore = projectStore;
        this.featureToggleService = featureToggleService;
        this.segmentService = segmentService;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getProxyFeatures(user: ApiUser): Promise<ProxyFeatureSchema[]> {
        // TODO: Implement getProxyFeatures.
        return [];
    }
}
