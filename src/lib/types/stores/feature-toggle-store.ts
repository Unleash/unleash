import { FeatureToggle, FeatureToggleDTO } from '../model';
import { Store } from './store';

export interface IFeatureToggleQuery {
    archived: boolean;
    project: string;
    stale: boolean;
}

export interface IHasFeature {
    name: string;
    archived: boolean;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query: Partial<IFeatureToggleQuery>): Promise<number>;
    getFeatureMetadata(name: string): Promise<FeatureToggle>;
    getFeatures(archived: boolean): Promise<FeatureToggle[]>;
    hasFeature(name: string): Promise<IHasFeature>;
    updateLastSeenForToggles(toggleNames: string[]): Promise<void>;
    getProjectId(name: string): Promise<string>;
    createFeature(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle>;
    updateFeature(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle>;
    archiveFeature(featureName: string): Promise<FeatureToggle>;
    reviveFeature(featureName: string): Promise<FeatureToggle>;
    getFeaturesBy(
        query: Partial<IFeatureToggleQuery>,
    ): Promise<FeatureToggle[]>;
}
