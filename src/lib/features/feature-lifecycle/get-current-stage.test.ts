import { getCurrentStage } from './get-current-stage';
import type { IFeatureLifecycleStage } from '../../types';

describe('getCurrentStage', () => {
    it('should return the first matching stage based on the preferred order', () => {
        const stages: IFeatureLifecycleStage[] = [
            {
                stage: 'initial',
                enteredStageAt: new Date('2024-04-22T10:00:00Z'),
            },
            {
                stage: 'completed',
                enteredStageAt: new Date('2024-04-20T09:00:00Z'),
            },
            {
                stage: 'archived',
                enteredStageAt: new Date('2024-04-19T08:00:00Z'),
            },
            { stage: 'live', enteredStageAt: new Date('2024-04-21T11:00:00Z') },
        ];

        const result = getCurrentStage(stages);

        expect(result).toEqual({
            stage: 'archived',
            enteredStageAt: new Date('2024-04-19T08:00:00Z'),
        });
    });

    it('should handle an empty stages array', () => {
        const stages: IFeatureLifecycleStage[] = [];

        const result = getCurrentStage(stages);

        expect(result).toBeUndefined();
    });
});
