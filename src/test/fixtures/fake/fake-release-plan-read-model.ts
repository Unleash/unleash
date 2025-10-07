import type { IReleasePlanReadModel } from '../../../lib/features/release-plans/release-plan-read-model-type.js';
import type { ReleasePlan } from '../../../lib/features/release-plans/release-plan.js';

export class FakeReleasePlanReadModel implements IReleasePlanReadModel {
    private releasePlans: Record<string, ReleasePlan[]>;

    constructor(releasePlans: Record<string, ReleasePlan[]> = {}) {
        this.releasePlans = releasePlans;
    }

    async getReleasePlans(
        _featureName: string,
        _environments: string[],
    ): Promise<Record<string, ReleasePlan[]>> {
        return this.releasePlans;
    }
}
