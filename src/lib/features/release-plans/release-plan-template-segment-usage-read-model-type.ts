export interface IReleasePlanTemplateSegmentUsageReadModel {
    isSegmentUsedInActiveTemplates(segmentId: number): Promise<boolean>;
}
