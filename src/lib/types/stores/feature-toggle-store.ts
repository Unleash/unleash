import { FeatureToggle, FeatureToggleDTO, IVariant } from '../model';
import { Store } from './store';

export interface IFeatureToggleQuery {
    archived: boolean;
    project: string;
    stale: boolean;
    type?: string;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query?: Partial<IFeatureToggleQuery>): Promise<number>;
    setLastSeen(toggleNames: string[]): Promise<void>;
    getProjectId(name: string): Promise<string | undefined>;
    create(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;
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
    getAll(query?: Partial<IFeatureToggleQuery>): Promise<FeatureToggle[]>;
    getAllByNames(names: string[]): Promise<FeatureToggle[]>;
    countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number>;
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
}
