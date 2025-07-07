import type { IFeatureStrategy } from '../../types/index.js';

export interface ReleasePlanMilestoneStrategy
    extends Partial<
        Pick<
            IFeatureStrategy,
            'title' | 'parameters' | 'constraints' | 'variants' | 'segments'
        >
    > {
    id: string;
    milestoneId: string;
    sortOrder: number;
    strategyName: string;
}
