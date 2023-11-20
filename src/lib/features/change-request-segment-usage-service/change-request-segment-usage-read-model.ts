type NewStrategy = {
    projectId: string;
    featureName: string;
    strategyName: string;
    environment: string;
};

type ExistingStrategy = NewStrategy & { id?: string };

type ChangeRequestStrategy = NewStrategy | ExistingStrategy;

export interface IChangeRequestSegmentUsageReadModel {
    isSegmentUsedInActiveChangeRequests(segmentId: number): Promise<boolean>;
    getSegmentsUsedInActiveChangeRequests(): Promise<ChangeRequestStrategy[]>;
}
