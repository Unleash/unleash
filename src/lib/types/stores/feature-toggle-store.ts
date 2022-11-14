import {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureEnvironmentVariant,
    IVariant,
} from '../model';
import { Store } from './store';

export interface IFeatureToggleQuery {
    archived: boolean;
    project: string;
    stale: boolean;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query?: Partial<IFeatureToggleQuery>): Promise<number>;
    setLastSeen(toggleNames: string[]): Promise<void>;
    getProjectId(name: string): Promise<string>;
    create(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;
    update(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;
    archive(featureName: string): Promise<FeatureToggle>;
    revive(featureName: string): Promise<FeatureToggle>;
    getAll(query?: Partial<IFeatureToggleQuery>): Promise<FeatureToggle[]>;
    getAllVariants(): Promise<IFeatureEnvironmentVariant[]>;
    getVariants(featureName: string): Promise<IVariant[]>;
    getVariantsForEnv(
        featureName: string,
        environment_name: string,
    ): Promise<IVariant[]>;
    saveVariants(
        project: string,
        featureName: string,
        newVariants: IVariant[],
    ): Promise<FeatureToggle>;
    saveVariantsOnEnv(
        featureName: string,
        environment: string,
        newVariants: IVariant[],
    ): Promise<IVariant[]>;
}
