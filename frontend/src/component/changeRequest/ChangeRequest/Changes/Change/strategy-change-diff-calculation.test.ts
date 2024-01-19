import { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import { getChangesThatWouldBeOverwritten } from './strategy-change-diff-calculation';

describe('Strategy change conflict detection', () => {
    const existingStrategy: IFeatureStrategy = {
        name: 'flexibleRollout',
        constraints: [],
        variants: [],
        parameters: {
            groupId: 'aaa',
            rollout: '71',
            stickiness: 'default',
        },
        sortOrder: 0,
        id: '31572930-2db7-461f-813b-3eedc200cb33',
        title: '',
        disabled: false,
        segments: [],
    };

    const snapshot: IFeatureStrategy = {
        id: '31572930-2db7-461f-813b-3eedc200cb33',
        name: 'flexibleRollout',
        title: '',
        disabled: false,
        segments: [],
        variants: [],
        sortOrder: 0,
        parameters: {
            groupId: 'aaa',
            rollout: '71',
            stickiness: 'default',
        },
        constraints: [],
    };

    const change: IChangeRequestUpdateStrategy = {
        id: 39,
        action: 'updateStrategy' as const,
        payload: {
            id: '31572930-2db7-461f-813b-3eedc200cb33',
            name: 'flexibleRollout',
            title: '',
            disabled: false,
            segments: [],
            snapshot,
            variants: [],
            parameters: {
                groupId: 'aaa',
                rollout: '38',
                stickiness: 'default',
            },
            constraints: [],
        },
        createdAt: new Date('2024-01-18T07:58:36.314Z'),
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
    };

    test('It compares strategies regardless of order of keys in the objects', () => {
        const result = getChangesThatWouldBeOverwritten(
            existingStrategy,
            change,
        );

        expect(result).toBeNull();
    });

    test('It treats `undefined` or missing segments in old config as equal to `[]` in change', () => {
        const resultUndefined = getChangesThatWouldBeOverwritten(
            {
                ...existingStrategy,
                segments: undefined,
            },
            change,
        );

        expect(resultUndefined).toBeNull();

        const { segments, ...withoutSegments } = existingStrategy;
        const resultMissing = getChangesThatWouldBeOverwritten(
            withoutSegments,
            change,
        );

        expect(resultMissing).toBeNull();
    });

    test('It treats `undefined` or missing strategy variants in old config and change as equal to `[]`', () => {
        const undefinedVariantsExistingStrategy = {
            ...existingStrategy,
            variants: undefined,
        };
        const { variants: _variants, ...missingVariantsExistingStrategy } =
            existingStrategy;

        const { variants: _snapshotVariants, ...snapshot } =
            change.payload.snapshot!;

        const undefinedVariantsInSnapshot = {
            ...change,
            payload: {
                ...change.payload,
                snapshot: {
                    ...snapshot,
                    variants: undefined,
                },
            },
        };

        const missingVariantsInSnapshot = {
            ...change,
            payload: {
                ...change.payload,
                snapshot: snapshot,
            },
        };

        // for all combinations, check that there are no changes
        const cases = [
            undefinedVariantsExistingStrategy,
            missingVariantsExistingStrategy,
        ].flatMap((existing) =>
            [undefinedVariantsInSnapshot, missingVariantsInSnapshot].map(
                (changeValue) =>
                    getChangesThatWouldBeOverwritten(existing, changeValue),
            ),
        );

        expect(cases.every((result) => result === null)).toBeTruthy();
    });

    test('It lists changes in a sorted list with the correct values', () => {
        const withChanges: IFeatureStrategy = {
            name: 'flexibleRollout',
            title: 'custom title',
            constraints: [
                {
                    values: ['blah'],
                    inverted: false,
                    operator: 'IN' as const,
                    contextName: 'appName',
                    caseInsensitive: false,
                },
            ],
            variants: [
                {
                    name: 'variant1',
                    weight: 1000,
                    payload: {
                        type: 'string',
                        value: 'beaty',
                    },
                    stickiness: 'userId',
                    weightType: 'variable' as const,
                },
            ],
            parameters: {
                groupId: 'aab',
                rollout: '39',
                stickiness: 'userId',
            },
            sortOrder: 1,
            id: '31572930-2db7-461f-813b-3eedc200cb33',
            disabled: true,
            segments: [3],
        };

        const result = getChangesThatWouldBeOverwritten(withChanges, change);

        const { id, name, ...changedProperties } = withChanges;

        const expectedOutput = Object.entries(changedProperties).map(
            ([property, oldValue]) => ({
                property,
                oldValue,
                newValue:
                    change.payload.snapshot![
                        property as keyof IFeatureStrategy
                    ],
            }),
        );

        expectedOutput.sort((a, b) => a.property.localeCompare(b.property));
        expect(result).toStrictEqual(expectedOutput);
    });

    test('it ignores object order on nested objects', () => {
        const existingStrategyMod: IFeatureStrategy = {
            ...existingStrategy,
            constraints: [
                {
                    values: ['blah'],
                    inverted: false,
                    operator: 'IN' as const,
                    contextName: 'appName',
                    caseInsensitive: false,
                },
            ],
        };

        const constraintChange: IChangeRequestUpdateStrategy = {
            ...change,
            payload: {
                ...change.payload,
                // @ts-expect-error Some of the properties that may be
                // undefined, we know exist in the value
                snapshot: {
                    ...change.payload.snapshot,
                    constraints: [
                        {
                            caseInsensitive: false,
                            contextName: 'appName',
                            inverted: false,
                            operator: 'IN' as const,
                            values: ['blah'],
                        },
                    ],
                },
            },
        };

        expect(
            getChangesThatWouldBeOverwritten(
                existingStrategyMod,
                constraintChange,
            ),
        ).toBeNull();
    });
});
