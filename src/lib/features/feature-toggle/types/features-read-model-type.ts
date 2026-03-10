export interface IFeaturesReadModel {
    featureExists(parent: string): Promise<boolean>;
    featureExistsInProject(
        featureName: string,
        projectId: string,
    ): Promise<boolean>;
    featuresInTheSameProject(
        featureA: string,
        featureB: string,
    ): Promise<boolean>;
}
