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

    deleteTagsForFeatures(tags: string[]): Promise<void>;

    strategiesExistForFeatures(
        featureNames: string[],
        environment: string,
    ): Promise<boolean>;

    getDisplayPermissions(
        names: string[],
    ): Promise<{ name: string; displayName: string }[]>;

    getExistingFeatures(featureNames: string[]): Promise<string[]>;
}
