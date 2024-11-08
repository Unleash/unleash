import type { Db, IUnleashConfig } from '../../../server-impl';
import FeatureToggleStore from '../../feature-toggle/feature-toggle-store';
import { FakeProjectLifecycleSummaryReadModel } from './fake-project-lifecycle-summary-read-model';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model-type';
import { ProjectLifecycleSummaryReadModel } from './project-lifecycle-summary-read-model';

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
