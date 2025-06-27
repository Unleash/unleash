export interface IFeaturesReadModel {
    featureExists(parent: string): Promise<boolean>;
    featuresInTheSameProject(
        featureA: string,
        featureB: string,
        project: string,
    ): Promise<boolean>;
}
