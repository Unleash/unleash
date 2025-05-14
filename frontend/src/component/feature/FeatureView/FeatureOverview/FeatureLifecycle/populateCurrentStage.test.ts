import { populateCurrentStage } from './populateCurrentStage.js';
import type { IFeatureToggle } from '../../../../../interfaces/featureToggle.js';

const enteredStageAt = 'date';

describe('populateCurrentStage', () => {
    it('should return undefined if lifecycle is not defined', () => {
        const feature = {};
        const result = populateCurrentStage(feature as IFeatureToggle);
        expect(result).toBeUndefined();
    });

    it('should return initial stage when lifecycle stage is initial', () => {
        const feature = {
            lifecycle: { stage: 'initial', enteredStageAt },
        };
        const expected = { name: 'initial', enteredStageAt };
        const result = populateCurrentStage(feature as IFeatureToggle);
        expect(result).toEqual(expected);
    });

    it('should correctly populate pre-live stage with dev environments', () => {
        const feature = {
            lifecycle: { stage: 'pre-live', enteredStageAt },
            environments: [
                { name: 'test', type: 'development', lastSeenAt: null },
                {
                    name: 'test1',
                    type: 'production',
                    lastSeenAt: '2022-08-01',
                    enabled: true,
                },
                { name: 'dev', type: 'development', lastSeenAt: '2022-08-01' },
                {
                    name: 'prod_disabled',
                    type: 'production',
                    lastSeenAt: '2022-08-02',
                    enabled: false,
                },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'pre-live',
            environments: [
                { name: 'dev', lastSeenAt: '2022-08-01' },
                { name: 'prod_disabled', lastSeenAt: '2022-08-02' },
            ],
            enteredStageAt,
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should handle live stage with production environments', () => {
        const feature = {
            lifecycle: { stage: 'live', enteredStageAt },
            environments: [
                {
                    name: 'prod',
                    type: 'production',
                    lastSeenAt: '2022-08-01',
                    enabled: true,
                },
                {
                    name: 'prod_ignore',
                    type: 'production',
                    lastSeenAt: '2022-08-01',
                    enabled: false,
                },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'live',
            environments: [{ name: 'prod', lastSeenAt: '2022-08-01' }],
            enteredStageAt,
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should return completed stage with production environments', () => {
        const feature = {
            lifecycle: { stage: 'completed', enteredStageAt },
            environments: [
                { name: 'prod', type: 'production', lastSeenAt: '2022-08-01' },
                { name: 'dev', type: 'development', lastSeenAt: '2022-08-01' },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'completed',
            status: 'kept',
            environments: [
                { name: 'prod', lastSeenAt: '2022-08-01' },
                { name: 'dev', lastSeenAt: '2022-08-01' },
            ],
            enteredStageAt,
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should return archived stage when lifecycle stage is archived', () => {
        const feature = {
            lifecycle: { stage: 'archived', enteredStageAt },
        } as IFeatureToggle;
        const expected = { name: 'archived', enteredStageAt };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });
});
