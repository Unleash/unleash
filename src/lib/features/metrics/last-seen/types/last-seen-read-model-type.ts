export interface IFeatureLastSeenResults {
    [featureName: string]: {
        [environment: string]: {
            lastSeen: string;
        };
    };
}
export interface ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
