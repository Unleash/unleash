import type { IReleasePlanTemplateSegmentUsageReadModel } from './release-plan-template-segment-usage-read-model-type.js';

export class FakeReleasePlanTemplateSegmentUsageReadModel
    implements IReleasePlanTemplateSegmentUsageReadModel
{
    async isSegmentUsedInActiveTemplates(): Promise<boolean> {
        return false;
    }
}
