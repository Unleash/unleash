import { IDependency } from '../../types';

export interface IDependentFeaturesReadModel {
    getChildren(parent: string): Promise<string[]>;
    getParents(child: string): Promise<IDependency[]>;
    getParentOptions(child: string): Promise<string[]>;
}
