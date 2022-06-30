import { validateSchema } from '../validate';

test('bootstrapUiSchema', () => {
    const data = {
        uiConfig: {
            flags: { E: true },
            authenticationType: 'open-source',
            unleashUrl: 'http://localhost:4242',
            version: '4.14.0-beta.0',
            baseUriPath: '',
            versionInfo: {
                current: { oss: '4.14.0-beta.0', enterprise: '' },
                latest: {},
                isLatest: true,
                instanceId: '51c9190a-4ff5-4f47-b73a-7aebe06f9331',
            },
        },
        user: {
            isAPI: false,
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            seenAt: '2022-06-27T12:19:15.838Z',
            loginAttempts: 0,
            createdAt: '2022-04-08T10:59:25.072Z',
            permissions: [
                { permission: 'READ_API_TOKEN' },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                { project: 'default', permission: 'UPDATE_FEATURE' },
            ],
        },
        email: false,
        context: [
            {
                name: 'appName',
                description: 'Allows you to constrain on application name',
                stickiness: false,
                sortOrder: 2,
                legalValues: [],
                createdAt: '2022-04-08T10:59:24.374Z',
            },
            {
                name: 'currentTime',
                description: '',
                stickiness: false,
                sortOrder: 10,
                legalValues: [],
                createdAt: '2022-05-18T08:15:18.917Z',
            },
            {
                name: 'environment',
                description:
                    'Allows you to constrain on application environment',
                stickiness: false,
                sortOrder: 0,
                legalValues: [],
                createdAt: '2022-04-08T10:59:24.374Z',
            },
            {
                name: 'userId',
                description: 'Allows you to constrain on userId',
                stickiness: false,
                sortOrder: 1,
                legalValues: [],
                createdAt: '2022-04-08T10:59:24.374Z',
            },
        ],
        featureTypes: [
            {
                id: 'release',
                name: 'Release',
                description:
                    'Release feature toggles are used to release new features.',
                lifetimeDays: 40,
            },
            {
                id: 'experiment',
                name: 'Experiment',
                description:
                    'Experiment feature toggles are used to test and verify multiple different versions of a feature.',
                lifetimeDays: 40,
            },
            {
                id: 'operational',
                name: 'Operational',
                description:
                    'Operational feature toggles are used to control aspects of a rollout.',
                lifetimeDays: 7,
            },
        ],
        tagTypes: [
            {
                name: 'simple',
                description: 'Used to simplify filtering of features',
                icon: '#',
            },
            { name: 'hashtag', description: '', icon: null },
        ],
        strategies: [
            {
                displayName: 'Standard',
                name: 'default',
                editable: false,
                description:
                    'The standard strategy is strictly on / off for your entire userbase.',
                parameters: [],
                deprecated: false,
            },
            {
                displayName: null,
                name: 'gradualRolloutRandom',
                editable: true,
                description:
                    'Randomly activate the feature toggle. No stickiness.',
                parameters: [
                    {
                        name: 'percentage',
                        type: 'percentage',
                        description: '',
                        required: false,
                    },
                ],
                deprecated: true,
            },
        ],
        projects: [
            {
                name: 'Default',
                id: 'default',
                description: 'Default project',
                health: 74,
                featureCount: 10,
                memberCount: 3,
                updatedAt: '2022-06-28T17:33:53.963Z',
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/bootstrapUiSchema', data),
    ).toBeUndefined();
});
