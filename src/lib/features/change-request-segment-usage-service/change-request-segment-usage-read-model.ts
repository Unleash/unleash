export interface IChangeRequestSegmentUsageReadModel {
    isSegmentUsedInActiveChangeRequests(segmentId: number): Promise<boolean>;
}
