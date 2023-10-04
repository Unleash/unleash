import { IDependency } from '../../types';

export interface IDependentFeaturesReadModel {
    getChildren(parents: string[]): Promise<string[]>;
    getParents(child: string): Promise<IDependency[]>;
    getParentOptions(child: string): Promise<string[]>;
    hasDependencies(feature: string): Promise<boolean>;
}
