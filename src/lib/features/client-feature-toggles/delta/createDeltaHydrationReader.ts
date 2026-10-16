import type { Db } from '../../../db/db.js';
import type { IClientSegment, IUnleashConfig } from '../../../types/index.js';
import { EventStore } from '../../events/event-store.js';
import { SegmentReadModel } from '../../segment/segment-read-model.js';
import ClientFeatureToggleDeltaReadModel from './client-feature-toggle-delta-read-model.js';
import type { FeatureConfigurationDeltaClient } from './client-feature-toggle-delta-read-model-type.js';
import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';
import { getReferencedSegmentIds } from './visible-revision.js';

export type ReadDeltaHydrationSnapshot = (environment: string) => Promise<{
    features: FeatureConfigurationDeltaClient[];
    segments: IClientSegment[];
    revisionState: EnvironmentVisibleRevisionState;
}>;

// Keep the transaction-scoped readers in the composition root. All three reads
// must see one snapshot: READ COMMITTED can label old features with a newer
// revision and permanently skip that revision's update on this node.
export const createDeltaHydrationReader =
    (
        db: Db,
        { eventBus, getLogger }: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>,
    ): ReadDeltaHydrationSnapshot =>
    (environment) =>
        db.transaction(
            async (transaction) => {
                const featureReadModel = new ClientFeatureToggleDeltaReadModel(
                    transaction,
                    eventBus,
                );
                const eventStore = new EventStore(transaction, getLogger);
                const segmentReadModel = new SegmentReadModel(transaction);
                const features = await featureReadModel.getAll({ environment });
                const revisionState = await eventStore.getDeltaRevisionState(
                    environment,
                    getReferencedSegmentIds(features),
                );
                const segments = await segmentReadModel.getAllForClientIds();
                return { features, segments, revisionState };
            },
            { isolationLevel: 'repeatable read', readOnly: true },
        );
