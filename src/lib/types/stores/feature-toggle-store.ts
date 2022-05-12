import { Store } from './store';
import { FeatureSchema } from '../../openapi/spec/feature-schema';
import { VariantSchema } from '../../openapi/spec/variant-schema';
import { FeatureToggle, FeatureToggleDTO, IVariant } from '../model';

export interface IFeatureToggleQuery {
    archived: boolean;
    project: string;
    stale: boolean;
}

export interface IFeatureToggleStore extends Store<FeatureToggle, string> {
    count(query?: Partial<IFeatureToggleQuery>): Promise<number>;
    setLastSeen(toggleNames: string[]): Promise<void>;
    getProjectId(name: string): Promise<string>;
    create(project: string, data: FeatureToggleDTO): Promise<FeatureSchema>;
    update(project: string, data: FeatureToggleDTO): Promise<FeatureSchema>;
    archive(featureName: string): Promise<FeatureToggle>;
    revive(featureName: string): Promise<FeatureToggle>;
    getAll(query?: Partial<IFeatureToggleQuery>): Promise<FeatureToggle[]>;
    getVariants(featureName: string): Promise<IVariant[]>;
    saveVariants(
        project: string,
        featureName: string,
        newVariants: VariantSchema[],
    ): Promise<FeatureSchema>;
}
