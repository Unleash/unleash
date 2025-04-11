import type { IFeatureStrategy } from '../../types';

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
