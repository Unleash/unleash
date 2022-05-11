import { Store } from './store';
import { FeatureSchema } from '../../openapi/spec/feature-schema';
import { VariantSchema } from '../../openapi/spec/variant-schema';
import { CreateFeatureSchema } from '../../openapi/spec/create-feature-schema';
import { UpdateFeatureSchema } from '../../openapi/spec/updateFeatureSchema';

export interface IFeatureToggleQuery {
    archived: boolean;
    project: string;
    stale: boolean;
}

export interface IFeatureToggleStore extends Store<FeatureSchema, string> {
    count(query?: Partial<IFeatureToggleQuery>): Promise<number>;
    setLastSeen(toggleNames: string[]): Promise<void>;
    getProjectId(name: string): Promise<string>;
    create(project: string, data: CreateFeatureSchema): Promise<FeatureSchema>;
    update(project: string, data: UpdateFeatureSchema): Promise<FeatureSchema>;
    archive(featureName: string): Promise<FeatureSchema>;
    revive(featureName: string): Promise<FeatureSchema>;
    getAll(query?: Partial<IFeatureToggleQuery>): Promise<FeatureSchema[]>;
    getVariants(featureName: string): Promise<VariantSchema[]>;
    saveVariants(
        project: string,
        featureName: string,
        newVariants: VariantSchema[],
    ): Promise<FeatureSchema>;
}
