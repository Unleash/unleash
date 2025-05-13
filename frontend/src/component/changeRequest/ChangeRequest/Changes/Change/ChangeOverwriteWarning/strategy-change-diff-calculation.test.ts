import type {
    ChangeRequestEditStrategy,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import type { IFeatureStrategy } from 'interfaces/strategy';
import omit from 'lodash.omit';
import {
    getSegmentChangesThatWouldBeOverwritten,
    getStrategyChangesThatWouldBeOverwritten,
} from './strategy-change-diff-calculation.js';

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
        const result = getStrategyChangesThatWouldBeOverwritten(
            existingStrategy,
            change,
        );

        expect(result).toBeNull();
    });

    test('It treats `undefined` or missing segments in old config as equal to `[]` in change', () => {
        const resultUndefined = getStrategyChangesThatWouldBeOverwritten(
            {
                ...existingStrategy,
                segments: undefined,
            },
            change,
        );

        expect(resultUndefined).toBeNull();

        const { segments, ...withoutSegments } = existingStrategy;
        const resultMissing = getStrategyChangesThatWouldBeOverwritten(
            withoutSegments,
            change,
        );

        expect(resultMissing).toBeNull();
    });

    test('It sorts segments before comparing (because their order is irrelevant)', () => {
        const result = getStrategyChangesThatWouldBeOverwritten(
            {
                ...existingStrategy,
                segments: [25, 26, 1],
            },
            {
                ...change,
                payload: {
                    ...change.payload,
                    segments: [26, 1, 25],
                },
            },
        );

        expect(result).toBeNull();
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
                    getStrategyChangesThatWouldBeOverwritten(
                        existing,
                        changeValue,
                    ),
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

        const result = getStrategyChangesThatWouldBeOverwritten(
            withChanges,
            change,
        );

        const { id, name, ...changedProperties } = withChanges;

        const expectedOutput = Object.entries(changedProperties).map(
            ([property, oldValue]) => ({
                property,
                oldValue,
                newValue:
                    change.payload[property as keyof ChangeRequestEditStrategy],
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
            getStrategyChangesThatWouldBeOverwritten(
                existingStrategyMod,
                constraintChange,
            ),
        ).toBeNull();
    });

    test('Any properties in the existing strategy that do not exist in the snapshot are also detected', () => {
        const { variants: _snapshotVariants, ...snapshot } =
            change.payload.snapshot!;

        const existingStrategyWithVariants = {
            ...existingStrategy,
            variants: [
                {
                    name: 'variant1',
                    weight: 1000,
                    payload: {
                        type: 'string' as const,
                        value: 'beaty',
                    },
                    stickiness: 'userId',
                    weightType: 'variable' as const,
                },
            ],
        };

        const result = getStrategyChangesThatWouldBeOverwritten(
            existingStrategyWithVariants,
            {
                ...change,
                payload: {
                    ...change.payload,
                    snapshot,
                },
            },
        );

        expect(result).toStrictEqual([
            {
                property: 'variants',
                oldValue: existingStrategyWithVariants.variants,
                newValue: [],
            },
        ]);
    });

    test('it returns null if the existing strategy is undefined', () => {
        const result = getStrategyChangesThatWouldBeOverwritten(
            undefined,
            change,
        );

        expect(result).toBeNull();
    });
    test('it returns null if the snapshot is missing', () => {
        const { snapshot, ...payload } = change.payload;
        const result = getStrategyChangesThatWouldBeOverwritten(
            existingStrategy,
            {
                ...change,
                payload,
            },
        );

        expect(result).toBeNull();
    });

    test('It treats `null` and `""` for `title` in the change as equal to `""` in the existing strategy', () => {
        const emptyTitleExistingStrategy = {
            ...existingStrategy,
            title: '',
        };
        const undefinedTitleExistingStrategy = omit(existingStrategy, 'title');

        const { title: _snapshotTitle, ...snapshot } = change.payload.snapshot!;

        const nullTitleInSnapshot = {
            ...change,
            payload: {
                ...change.payload,
                snapshot: {
                    ...snapshot,
                    title: null,
                },
            },
        };

        const emptyTitleInSnapshot = {
            ...change,
            payload: {
                ...change.payload,
                snapshot: {
                    ...snapshot,
                    title: '',
                },
            },
        };

        const missingTitleInSnapshot = {
            ...change,
            payload: {
                ...change.payload,
                snapshot,
            },
        };

        const cases = [
            undefinedTitleExistingStrategy,
            emptyTitleExistingStrategy,
        ].flatMap((existing) =>
            [
                nullTitleInSnapshot,
                emptyTitleInSnapshot,
                missingTitleInSnapshot,
            ].map((changeValue) =>
                getStrategyChangesThatWouldBeOverwritten(existing, changeValue),
            ),
        );

        expect(cases.every((result) => result === null)).toBeTruthy();
    });

    test('it shows a diff for a property if the snapshot and live version differ for that property and the changed value is different from the live version', () => {
        const liveVersion = {
            ...existingStrategy,
            title: 'new-title',
        };

        const changedVersion = {
            ...change,
            payload: {
                ...change.payload,
                title: 'other-new-title',
            },
        };
        const result = getStrategyChangesThatWouldBeOverwritten(
            liveVersion,
            changedVersion,
        );

        expect(result).toStrictEqual([
            {
                property: 'title',
                oldValue: liveVersion.title,
                newValue: changedVersion.payload.title,
            },
        ]);
    });

    test('it does not show a diff for a property if the live version and the change have the same value, even if the snapshot differs from the live version', () => {
        const liveVersion = {
            ...existingStrategy,
            title: 'new-title',
        };

        const changedVersion = {
            ...change,
            payload: {
                ...change.payload,
                title: liveVersion.title,
            },
        };
        const result = getStrategyChangesThatWouldBeOverwritten(
            liveVersion,
            changedVersion,
        );

        expect(result).toBeNull();
    });

    test('it does not show a diff for a property if the snapshot and the live version are the same', () => {
        const changedVersion = {
            ...change,
            payload: {
                ...change.payload,
                title: 'new-title',
            },
        };
        const result = getStrategyChangesThatWouldBeOverwritten(
            existingStrategy,
            changedVersion,
        );

        expect(result).toBeNull();
    });
});

describe('Segment change conflict detection', () => {
    const snapshot = {
        id: 12,
        name: 'Original name',
        project: 'change-request-conflict-handling',
        createdAt: '2024-02-06T09:11:23.782Z',
        createdBy: 'admin',
        constraints: [],
        description: '',
    };

    const change: IChangeRequestUpdateSegment = {
        id: 39,
        action: 'updateSegment' as const,
        name: 'what?a',
        payload: {
            id: 12,
            name: 'Original name',
            project: 'change-request-conflict-handling',
            constraints: [],
            snapshot,
        },
    };

    test('it registers any change in constraints as everything will be overwritten', () => {
        const segmentWithConstraints = {
            ...snapshot,
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

        const changeWithConstraints = {
            ...change,
            payload: {
                ...change.payload,
                constraints: [
                    ...segmentWithConstraints.constraints,
                    {
                        values: ['bluh'],
                        inverted: false,
                        operator: 'IN' as const,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
            },
        };

        const result = getSegmentChangesThatWouldBeOverwritten(
            segmentWithConstraints,
            changeWithConstraints,
        );

        expect(result).toStrictEqual([
            {
                property: 'constraints',
                oldValue: segmentWithConstraints.constraints,
                newValue: changeWithConstraints.payload.constraints,
            },
        ]);
    });

    test('It treats missing description in change as equal to an empty description in snapshot', () => {
        const result = getSegmentChangesThatWouldBeOverwritten(
            snapshot,
            change,
        );

        expect(result).toBeNull();
    });
});
