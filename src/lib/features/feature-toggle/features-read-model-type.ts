export interface IFeaturesReadModel {
    featureExists(parent: string): Promise<boolean>;
}
