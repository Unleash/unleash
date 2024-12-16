import type {
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    ISegmentReadModel,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

import type { Logger } from '../../logger';

import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type {
    RevisionDeltaEntry,
    ClientFeatureToggleDelta,
} from './delta/client-feature-toggle-delta';

export class ClientFeatureToggleService {
    private logger: Logger;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private segmentReadModel: ISegmentReadModel;

    private clientFeatureToggleDelta: ClientFeatureToggleDelta | null = null;

    constructor(
        {
            clientFeatureToggleStore,
        }: Pick<IUnleashStores, 'clientFeatureToggleStore'>,
        segmentReadModel: ISegmentReadModel,
        clientFeatureToggleCache: ClientFeatureToggleDelta | null,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.segmentReadModel = segmentReadModel;
        this.clientFeatureToggleDelta = clientFeatureToggleCache;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
    }

    async getActiveSegmentsForClient() {
        return this.segmentReadModel.getActiveForClient();
    }

    async getClientDelta(
        revisionId: number | undefined,
        query: IFeatureToggleQuery,
    ): Promise<RevisionDeltaEntry | undefined> {
        if (this.clientFeatureToggleDelta !== null) {
            return this.clientFeatureToggleDelta.getDelta(revisionId, query);
        } else {
            throw new Error(
                'Calling the partial updates but the cache is not initialized',
            );
        }
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.clientFeatureToggleStore.getClient(
            query || {},
        );

        return result.map(
            ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }) => ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }),
        );
    }
}
