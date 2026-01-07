import type {
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    ISegmentReadModel,
    IUnleashConfig,
    IUnleashStores,
} from '../../types/index.js';

import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { ClientFeatureToggleDelta } from './delta/client-feature-toggle-delta.js';
import type { ClientFeaturesDeltaSchema } from '../../openapi/index.js';

export class ClientFeatureToggleService {
    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private segmentReadModel: ISegmentReadModel;

    private clientFeatureToggleDelta: ClientFeatureToggleDelta | null = null;

    constructor(
        {
            clientFeatureToggleStore,
        }: Pick<IUnleashStores, 'clientFeatureToggleStore'>,
        segmentReadModel: ISegmentReadModel,
        clientFeatureToggleCache: ClientFeatureToggleDelta | null,
        _config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
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
    ): Promise<ClientFeaturesDeltaSchema | undefined> {
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
