import { getCurrentStage } from './get-current-stage.js';
import type { IFeatureLifecycleStage } from '../../types/index.js';

const irrelevantDate = new Date('2024-04-22T10:00:00Z');

describe('getCurrentStage', () => {
    it('should return the first matching stage based on the preferred order', () => {
        const stages: IFeatureLifecycleStage[] = [
            {
                stage: 'initial',
                enteredStageAt: irrelevantDate,
            },
            {
                stage: 'completed',
                status: 'kept',
                enteredStageAt: irrelevantDate,
            },
            {
                stage: 'archived',
                enteredStageAt: irrelevantDate,
            },
            { stage: 'live', enteredStageAt: irrelevantDate },
        ];

        const result = getCurrentStage(stages);

        expect(result).toEqual({
            stage: 'archived',
            enteredStageAt: irrelevantDate,
        });
    });

    it('should handle an empty stages array', () => {
        const stages: IFeatureLifecycleStage[] = [];

        const result = getCurrentStage(stages);

        expect(result).toBeUndefined();
    });
});
