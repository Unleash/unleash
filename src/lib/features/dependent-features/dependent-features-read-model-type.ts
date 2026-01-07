import type { IDependency, IFeatureDependency } from '../../types/index.js';

export interface IDependentFeaturesReadModel {
    getChildren(parents: string[]): Promise<string[]>;
    // given a list of parents and children verifies if some children would be orphaned after deletion
    // we're interested in the list of parents, not orphans
    getOrphanParents(parentsAndChildren: string[]): Promise<string[]>;
    getParents(child: string): Promise<IDependency[]>;
    getDependencies(children: string[]): Promise<IFeatureDependency[]>;
    getPossibleParentFeatures(child: string): Promise<string[]>;
    getPossibleParentVariants(parent: string): Promise<string[]>;
    haveDependencies(features: string[]): Promise<boolean>;
    hasAnyDependencies(): Promise<boolean>;
}
