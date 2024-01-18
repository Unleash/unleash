import { getChangesThatWouldBeOverwritten } from './StrategyChange';

describe('Strategy change conflict detection', () => {
    const testCases = {
        old: {
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
        },
        change: {
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
        },
    };
    test('It ignores property order in strategy comparison', () => {
        const result = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: testCases.old,
            change: testCases.change,
        });

        expect(result).toBeNull();
    });
    test('It treats `undefined` or missing segments in old config as equal to `[]` in change', () => {
        const resultUndefined = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: {
                ...testCases.old,
                segments: undefined,
            },
            change: testCases.change,
        });

        expect(resultUndefined).toBeNull();

        const { segments, ...withoutSegments } = testCases.old;
        const resultMissing = getChangesThatWouldBeOverwritten({
            currentStrategyConfig: withoutSegments,
            change: testCases.change,
        });

        expect(resultMissing).toBeNull();
    });
    test('It lists changes with the correct ', () => {});
});
