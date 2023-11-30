type ChangeRequestInfo = { id: number; title: string | null };

type NewStrategy = {
    projectId: string;
    featureName: string;
    strategyName: string;
    environment: string;
    changeRequest: ChangeRequestInfo;
};

type ExistingStrategy = NewStrategy & { id: string };

export type ChangeRequestStrategy = NewStrategy | ExistingStrategy;

export interface IChangeRequestSegmentUsageReadModel {
    getStrategiesUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<ChangeRequestStrategy[]>;
}
