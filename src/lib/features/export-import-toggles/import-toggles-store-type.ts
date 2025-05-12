export interface ProjectFeaturesLimit {
    limit: number;
    newFeaturesCount: number;
    currentFeaturesCount: number;
}

export interface IImportTogglesStore {
    deleteStrategiesForFeatures(
        featureNames: string[],
        environment: string,
    ): Promise<void>;

    getArchivedFeatures(featureNames: string[]): Promise<string[]>;

    getFeaturesInOtherProjects(
        featureNames: string[],
        project: string,
    ): Promise<{ name: string; project: string }[]>;

    getFeaturesInProject(
        featureNames: string[],
        project: string,
    ): Promise<string[]>;

    getProjectFeaturesLimit(
        featureNames: string[],
        project: string,
    ): Promise<ProjectFeaturesLimit>;

    deleteTagsForFeatures(features: string[]): Promise<void>;
    deleteLinksForFeatures(features: string[]): Promise<void>;

    strategiesExistForFeatures(
        featureNames: string[],
        environment: string,
    ): Promise<boolean>;

    getDisplayPermissions(
        names: string[],
    ): Promise<{ name: string; displayName: string }[]>;

    getExistingFeatures(featureNames: string[]): Promise<string[]>;
}
