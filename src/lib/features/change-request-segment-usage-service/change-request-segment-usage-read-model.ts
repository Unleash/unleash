type ChangeRequestInfo = { id: string; title: string | null };

type NewStrategy = {
    projectId: string;
    featureName: string;
    strategyName: string;
    environment: string;
    changeRequests: [ChangeRequestInfo, ...ChangeRequestInfo[]];
};

type ExistingStrategy = NewStrategy & { id: string };

export type ChangeRequestStrategy = NewStrategy | ExistingStrategy;

export interface IChangeRequestSegmentUsageReadModel {
    getStrategiesUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<ChangeRequestStrategy[]>;
}
