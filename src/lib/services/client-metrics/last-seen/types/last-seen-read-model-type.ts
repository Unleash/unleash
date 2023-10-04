export interface ILastSeenReadModel {
    getForFeature(
        features: string[],
    ): Promise<{ lastSeen: Date; environment: string }[]>;
}
