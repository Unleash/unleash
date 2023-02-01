import { subDays } from 'date-fns';
import type { IFeatureType } from 'lib/types/stores/feature-type-store';
import { calculateProjectHealth } from './project-health';

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
