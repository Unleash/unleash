export interface IFeaturesReadModel {
    featureExists(parent: string): Promise<boolean>;
    featureExistsInProject(
        featureName: string,
        projectId: string,
    ): Promise<boolean>;
    featuresInProject(
        featureA: string,
        featureB: string,
        projectId: string,
    ): Promise<boolean>;
}
