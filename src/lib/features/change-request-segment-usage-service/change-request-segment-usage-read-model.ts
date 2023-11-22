type NewStrategy = {
    projectId: string;
    featureName: string;
    strategyName: string;
    environment: string;
    changeRequestIds: [string, string[]];
};

type ExistingStrategy = NewStrategy & { id: string };

export type ChangeRequestStrategy = NewStrategy | ExistingStrategy;

export interface IChangeRequestSegmentUsageReadModel {
    getStrategiesUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<ChangeRequestStrategy[]>;
}
