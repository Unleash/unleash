export interface IDependentFeaturesReadModel {
    getChildren(parent: string): Promise<string[]>;
    getParents(child: string): Promise<string[]>;
    getParentOptions(child: string): Promise<string[]>;
}
