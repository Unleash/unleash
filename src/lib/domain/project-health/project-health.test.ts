import { calculateHealthRating } from './project-health.js';

describe('calculateHealthRating', () => {
    it('works with no feature flags', () => {
        expect(
            calculateHealthRating({
                totalCount: 0,
                staleCount: 0,
                potentiallyStaleCount: 0,
            }),
        ).toEqual(100);
    });

    it('works with stale and active feature flags', () => {
        expect(
            calculateHealthRating({
                totalCount: 2,
                staleCount: 2,
                potentiallyStaleCount: 0,
            }),
        ).toEqual(0);
        expect(
            calculateHealthRating({
                totalCount: 2,
                staleCount: 1,
                potentiallyStaleCount: 0,
            }),
        ).toEqual(50);
        expect(
            calculateHealthRating({
                totalCount: 3,
                staleCount: 1,
                potentiallyStaleCount: 0,
            }),
        ).toEqual(67);
    });

    it('counts potentially stale flags', () => {
        expect(
            calculateHealthRating({
                totalCount: 4,
                staleCount: 2,
                potentiallyStaleCount: 1,
            }),
        ).toEqual(25);
    });
});
