import type { Db, IUnleashConfig } from '../../../types/index.js';
import FeatureToggleStore from '../../feature-toggle/feature-toggle-store.js';
import { FakeProjectLifecycleSummaryReadModel } from './fake-project-lifecycle-summary-read-model.js';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model-type.js';
import { ProjectLifecycleSummaryReadModel } from './project-lifecycle-summary-read-model.js';

export const createProjectLifecycleSummaryReadModel = (
    db: Db,
    config: IUnleashConfig,
): IProjectLifecycleSummaryReadModel => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    return new ProjectLifecycleSummaryReadModel(db, featureToggleStore);
};

export const createFakeProjectLifecycleSummaryReadModel =
    (): IProjectLifecycleSummaryReadModel => {
        return new FakeProjectLifecycleSummaryReadModel();
    };
