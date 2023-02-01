import { subDays } from 'date-fns';
import type { IFeatureType } from 'lib/types/stores/feature-type-store';
import {
    calculateProjectHealth,
    calculateHealthRating,
} from './project-health';

const exampleFeatureTypes: IFeatureType[] = [
    {
        id: 'default',
        name: 'Default',
        description: '',
        lifetimeDays: 30,
    },
    {
        id: 'short-lived',
        name: 'Short lived',
        description: '',
        lifetimeDays: 7,
    },
    {
        id: 'non-expiring',
        name: 'Long lived',
        description: '',
        lifetimeDays: null,
    },
];

describe('calculateProjectHealth', () => {
    it('works with empty features', () => {
        expect(calculateProjectHealth([], exampleFeatureTypes)).toEqual({
            activeCount: 0,
            staleCount: 0,
            potentiallyStaleCount: 0,
        });
    });

    it('counts active toggles', () => {
        const features = [{ stale: false }, {}];

        expect(calculateProjectHealth(features, exampleFeatureTypes)).toEqual({
            activeCount: 2,
            staleCount: 0,
            potentiallyStaleCount: 0,
        });
    });

    it('counts stale toggles', () => {
        const features = [{ stale: true }, { stale: false }, {}];

        expect(calculateProjectHealth(features, exampleFeatureTypes)).toEqual({
            activeCount: 2,
            staleCount: 1,
            potentiallyStaleCount: 0,
        });
    });

    it('takes feature type into account when calculating potentially stale toggles', () => {
        expect(
            calculateProjectHealth(
                [
                    {
                        stale: false,
                        createdAt: subDays(Date.now(), 15),
                        type: 'default',
                    },
                ],
                exampleFeatureTypes,
            ),
        ).toEqual({
            activeCount: 1,
            staleCount: 0,
            potentiallyStaleCount: 0,
        });

        expect(
            calculateProjectHealth(
                [
                    {
                        stale: false,
                        createdAt: subDays(Date.now(), 31),
                        type: 'default',
                    },
                ],
                exampleFeatureTypes,
            ),
        ).toEqual({
            activeCount: 1,
            staleCount: 0,
            potentiallyStaleCount: 1,
        });

        expect(
            calculateProjectHealth(
                [
                    {
                        stale: false,
                        createdAt: subDays(Date.now(), 15),
                        type: 'short-lived',
                    },
                ],
                exampleFeatureTypes,
            ),
        ).toEqual({
            activeCount: 1,
            staleCount: 0,
            potentiallyStaleCount: 1,
        });
    });

    it("doesn't count stale toggles as potentially stale or stale as active", () => {
        const features = [
            {
                stale: true,
                createdAt: subDays(Date.now(), 31),
                type: 'default',
            },
            {
                stale: false,
                createdAt: subDays(Date.now(), 31),
                type: 'default',
            },
        ];

        expect(calculateProjectHealth(features, exampleFeatureTypes)).toEqual({
            activeCount: 1,
            staleCount: 1,
            potentiallyStaleCount: 1,
        });
    });

    it('counts non-expiring types properly', () => {
        const features = [
            {
                createdAt: subDays(Date.now(), 366),
                type: 'non-expiring',
            },
            {
                createdAt: subDays(Date.now(), 366),
                type: 'default',
            },
        ];

        expect(calculateProjectHealth(features, exampleFeatureTypes)).toEqual({
            activeCount: 2,
            staleCount: 0,
            potentiallyStaleCount: 1,
        });
    });
});

describe('calculateHealthRating', () => {
    it('works with empty feature toggles', () => {
        expect(calculateHealthRating([], exampleFeatureTypes)).toEqual(100);
    });

    it('works with stale and active feature toggles', () => {
        expect(
            calculateHealthRating(
                [{ stale: true }, { stale: true }],
                exampleFeatureTypes,
            ),
        ).toEqual(0);
        expect(
            calculateHealthRating(
                [{ stale: true }, { stale: false }],
                exampleFeatureTypes,
            ),
        ).toEqual(50);
        expect(
            calculateHealthRating(
                [{ stale: false }, { stale: true }, { stale: false }],
                exampleFeatureTypes,
            ),
        ).toEqual(67);
    });

    it('counts potentially stale toggles', () => {
        expect(
            calculateHealthRating(
                [
                    { createdAt: subDays(Date.now(), 1), type: 'default' },
                    {
                        stale: true,
                        createdAt: subDays(Date.now(), 1),
                        type: 'default',
                    },
                    {
                        stale: true,
                        createdAt: subDays(Date.now(), 31),
                        type: 'default',
                    },
                    {
                        stale: false,
                        createdAt: subDays(Date.now(), 31),
                        type: 'default',
                    },
                ],
                exampleFeatureTypes,
            ),
        ).toEqual(25);
    });
});
