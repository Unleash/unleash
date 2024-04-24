import { populateCurrentStage } from './populateCurrentStage';
import type { IFeatureToggle } from '../../../../../interfaces/featureToggle';

describe('populateCurrentStage', () => {
    it('should return undefined if lifecycle is not defined', () => {
        const feature = {};
        const result = populateCurrentStage(feature as IFeatureToggle);
        expect(result).toBeUndefined();
    });

    it('should return initial stage when lifecycle stage is initial', () => {
        const feature = {
            lifecycle: { stage: 'initial' },
        };
        const expected = { name: 'initial' };
        const result = populateCurrentStage(feature as IFeatureToggle);
        expect(result).toEqual(expected);
    });

    it('should correctly populate pre-live stage with dev environments', () => {
        const feature = {
            lifecycle: { stage: 'pre-live' },
            environments: [
                { name: 'test', type: 'development', lastSeenAt: null },
                { name: 'test1', type: 'production', lastSeenAt: '2022-08-01' },
                { name: 'dev', type: 'development', lastSeenAt: '2022-08-01' },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'pre-live',
            environments: [{ name: 'dev', lastSeenAt: '2022-08-01' }],
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should handle live stage with production environments', () => {
        const feature = {
            lifecycle: { stage: 'live' },
            environments: [
                { name: 'prod', type: 'production', lastSeenAt: '2022-08-01' },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'live',
            environments: [{ name: 'prod', lastSeenAt: '2022-08-01' }],
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should return completed stage with production environments', () => {
        const feature = {
            lifecycle: { stage: 'completed' },
            environments: [
                { name: 'prod', type: 'production', lastSeenAt: '2022-08-01' },
            ],
        } as IFeatureToggle;
        const expected = {
            name: 'completed',
            status: 'kept',
            environments: [{ name: 'prod', lastSeenAt: '2022-08-01' }],
        };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });

    it('should return archived stage when lifecycle stage is archived', () => {
        const feature = {
            lifecycle: { stage: 'archived' },
        } as IFeatureToggle;
        const expected = { name: 'archived' };
        const result = populateCurrentStage(feature);
        expect(result).toEqual(expected);
    });
});
