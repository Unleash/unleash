import {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureToggleQuery,
    IFeatureTypeCount,
    IVariant,
} from '../../../types/model';
import { FeatureToggleInsert } from '../feature-toggle-store';
import { Store } from '../../../types/stores/store';
import { LastSeenInput } from '../../metrics/last-seen/last-seen-service';
import { FeatureConfigurationClient } from './feature-toggle-strategies-store-type';
import { IFeatureProjectUserParams } from '../feature-toggle-controller';

export interface IFeatureToggleStoreQuery {
    archived: boolean;
    project: string;
    stale: boolean;
    type?: string;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query?: Partial<IFeatureToggleStoreQuery>): Promise<number>;

    setLastSeen(data: LastSeenInput[]): Promise<void>;

    getProjectId(name: string): Promise<string | undefined>;

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

    getArchivedFeatures(project?: string): Promise<FeatureToggle[]>;

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

    /**
     * @deprecated - Variants should be fetched from FeatureEnvironmentStore (since variants are now; since 4.18, connected to environments)
     * @param featureName
     * TODO: Remove before release 5.0
     */
    getVariants(featureName: string): Promise<IVariant[]>;

    /**
     * TODO: Remove before release 5.0
     * @deprecated - Variants should be fetched from FeatureEnvironmentStore (since variants are now; since 4.18, connected to environments)
     * @param project
     * @param featureName
     * @param newVariants
     */
    saveVariants(
        project: string,
        featureName: string,
        newVariants: IVariant[],
    ): Promise<FeatureToggle>;

    disableAllEnvironmentsForFeatures(names: string[]): Promise<void>;

    getFeatureTypeCounts(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureTypeCount[]>;

    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
