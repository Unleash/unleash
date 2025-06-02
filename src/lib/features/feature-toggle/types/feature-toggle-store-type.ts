import type {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureToggleQuery,
    IFeatureTypeCount,
} from '../../../types/model.js';
import type { FeatureToggleInsert } from '../feature-toggle-store.js';
import type { Store } from '../../../types/stores/store.js';
import type { LastSeenInput } from '../../metrics/last-seen/last-seen-service.js';
import type { FeatureConfigurationClient } from './feature-toggle-strategies-store-type.js';
import type { IFeatureProjectUserParams } from '../feature-toggle-controller.js';

export interface IFeatureToggleStoreQuery {
    archived: boolean;
    project: string;
    stale: boolean;
    type?: string;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query?: Partial<IFeatureToggleStoreQuery>): Promise<number>;

    setLastSeen(data: LastSeenInput[]): Promise<void>;

    getProjectId(name: string | undefined): Promise<string | undefined>;

    create(project: string, data: FeatureToggleInsert): Promise<FeatureToggle>;

    update(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;

    archive(featureName: string): Promise<FeatureToggle>;

    batchArchive(featureNames: string[]): Promise<FeatureToggle[]>;

    batchStale(
        featureNames: string[],
        stale: boolean,
    ): Promise<FeatureToggle[]>;

    batchDelete(featureNames: string[]): Promise<void>;

    batchRevive(featureNames: string[]): Promise<FeatureToggle[]>;

    revive(featureName: string): Promise<FeatureToggle>;

    getAll(query?: Partial<IFeatureToggleStoreQuery>): Promise<FeatureToggle[]>;

    getAllByNames(names: string[]): Promise<FeatureToggle[]>;

    getFeatureToggleList(
        featureQuery?: IFeatureToggleQuery,
        userId?: number,
        archived?: boolean,
    ): Promise<FeatureToggle[]>;

    getPlaygroundFeatures(
        featureQuery?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]>;

    countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number>;

    updatePotentiallyStaleFeatures(currentTime?: string): Promise<
        {
            name: string;
            potentiallyStale: boolean;
            project: string;
        }[]
    >;

    isPotentiallyStale(featureName: string): Promise<boolean>;

    disableAllEnvironmentsForFeatures(names: string[]): Promise<void>;

    getFeatureTypeCounts(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureTypeCount[]>;

    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
