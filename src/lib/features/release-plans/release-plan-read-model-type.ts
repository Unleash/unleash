import type { ReleasePlan } from './release-plan.js';

export interface IReleasePlanReadModel {
    getReleasePlans(
        featureName: string,
        environments: string[],
    ): Promise<Record<string, ReleasePlan[]>>;
}
