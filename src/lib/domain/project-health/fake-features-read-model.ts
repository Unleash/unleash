import type { IProjectHealthFeaturesReadModel } from './features-read-model.js';

export class FakeProjectHealthFeaturesReadModel
    implements IProjectHealthFeaturesReadModel
{
    private potentiallyStaleCount: number;

    constructor({
        potentiallyStaleCount = 0,
    }: { potentiallyStaleCount?: number } = {}) {
        this.potentiallyStaleCount = potentiallyStaleCount;
    }

    async getPotentiallyStaleCount(): Promise<number> {
        return this.potentiallyStaleCount;
    }
}
