import { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import { getChangesThatWouldBeOverwritten } from './StrategyChange';

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

    const change: IChangeRequestUpdateStrategy = {
        id: 39,
        action: 'updateStrategy' as const,
        payload: {
            id: '31572930-2db7-461f-813b-3eedc200cb33',
            name: 'flexibleRollout',
            title: '',
            disabled: false,
            segments: [],
            snapshot: {
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
            },
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

    test('It ignores property order in strategy comparison', () => {
        const result = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: existingStrategy,
            change: change,
        });

        expect(result).toBeNull();
    });

    test('It treats `undefined` or missing segments in old config as equal to `[]` in change', () => {
        const resultUndefined = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: {
                ...existingStrategy,
                segments: undefined,
            },
            change: change,
        });

        expect(resultUndefined).toBeNull();

        const { segments, ...withoutSegments } = existingStrategy;
        const resultMissing = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: withoutSegments,
            change: change,
        });

        expect(resultMissing).toBeNull();
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

        const result = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: withChanges,
            change: change,
        });

        const { id, name, ...changedProperties } = withChanges;

        // const expectedOutput = Object.entries(changedProperties).map(
        //     ([property, oldValue]) => ({
        //         property,
        //         oldValue,
        //         newValue: change.payload.snapshot[property],
        //     }),
        // );

        expect(result).toStrictEqual([
            {
                property: 'constraints',
                oldValue: [
                    {
                        values: ['blah'],
                        inverted: false,
                        operator: 'IN' as const,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                newValue: [],
            },
            { property: 'disabled', oldValue: true, newValue: false },
            { property: 'segments', oldValue: [3], newValue: [] },
            { property: 'sortOrder', oldValue: 1, newValue: 0 },
            { property: 'title', oldValue: 'custom title', newValue: '' },
            {
                property: 'parameters',
                oldValue: {
                    groupId: 'aab',
                    rollout: '39',
                    stickiness: 'userId',
                },
                newValue: {
                    groupId: 'aaa',
                    rollout: '71',
                    stickiness: 'default',
                },
            },
            {
                property: 'variants',
                oldValue: [
                    {
                        name: 'variant1',
                        weight: 1000,
                        payload: { type: 'string', value: 'beaty' },
                        stickiness: 'userId',
                        weightType: 'variable' as const,
                    },
                ],
                newValue: [],
            },
        ]);
    });

    test('it ignores object order on nested objects', () => {});
});
