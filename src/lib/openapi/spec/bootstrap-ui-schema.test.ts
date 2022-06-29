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
                    project: 'cardboard_box',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'staging',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'staging',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'staging',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'staging',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'staging',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'staging',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'cardboard_box',
                    environment: 'development',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'development',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'development',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'development',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'development',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'development',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'development',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'development',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'development',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'development',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'development',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'cardboard_box',
                    environment: 'production',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'production',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'production',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'production',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'production',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'production',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'production',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'production',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'production',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'production',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'production',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'cardboard_box',
                    environment: 'default',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'default',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'default',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'default',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'default',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'default',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'default',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'default',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'default',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'default',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'default',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                { project: 'cardboard_box', permission: 'CREATE_FEATURE' },
                { project: 'default', permission: 'CREATE_FEATURE' },
                { project: 'flux', permission: 'CREATE_FEATURE' },
                { project: 'heatshrink', permission: 'CREATE_FEATURE' },
                { project: 'solderingIron', permission: 'CREATE_FEATURE' },
                { project: 'cardboard_box', permission: 'UPDATE_FEATURE' },
                { project: 'default', permission: 'UPDATE_FEATURE' },
                { project: 'flux', permission: 'UPDATE_FEATURE' },
                { project: 'heatshrink', permission: 'UPDATE_FEATURE' },
                { project: 'solderingIron', permission: 'UPDATE_FEATURE' },
                { project: 'cardboard_box', permission: 'DELETE_FEATURE' },
                { project: 'default', permission: 'DELETE_FEATURE' },
                { project: 'flux', permission: 'DELETE_FEATURE' },
                { project: 'heatshrink', permission: 'DELETE_FEATURE' },
                { project: 'solderingIron', permission: 'DELETE_FEATURE' },
                { project: 'cardboard_box', permission: 'UPDATE_PROJECT' },
                { project: 'default', permission: 'UPDATE_PROJECT' },
                { project: 'flux', permission: 'UPDATE_PROJECT' },
                { project: 'heatshrink', permission: 'UPDATE_PROJECT' },
                { project: 'solderingIron', permission: 'UPDATE_PROJECT' },
                { project: 'cardboard_box', permission: 'DELETE_PROJECT' },
                { project: 'default', permission: 'DELETE_PROJECT' },
                { project: 'flux', permission: 'DELETE_PROJECT' },
                { project: 'heatshrink', permission: 'DELETE_PROJECT' },
                { project: 'solderingIron', permission: 'DELETE_PROJECT' },
                {
                    project: 'cardboard_box',
                    permission: 'UPDATE_FEATURE_VARIANTS',
                },
                { project: 'default', permission: 'UPDATE_FEATURE_VARIANTS' },
                { project: 'flux', permission: 'UPDATE_FEATURE_VARIANTS' },
                {
                    project: 'heatshrink',
                    permission: 'UPDATE_FEATURE_VARIANTS',
                },
                {
                    project: 'solderingIron',
                    permission: 'UPDATE_FEATURE_VARIANTS',
                },
                { permission: 'ADMIN' },
                { project: 'cardboard_box', permission: 'MOVE_FEATURE_TOGGLE' },
                { project: 'default', permission: 'MOVE_FEATURE_TOGGLE' },
                { project: 'flux', permission: 'MOVE_FEATURE_TOGGLE' },
                { project: 'heatshrink', permission: 'MOVE_FEATURE_TOGGLE' },
                { project: 'solderingIron', permission: 'MOVE_FEATURE_TOGGLE' },
                { permission: 'CREATE_SEGMENT' },
                { permission: 'UPDATE_SEGMENT' },
                { permission: 'DELETE_SEGMENT' },
                {
                    project: 'cardboard_box',
                    environment: 'ci-e2e',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ci-e2e',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ci-e2e',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ci-e2e',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ci-e2e',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ci-e2e',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ci-e2e',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ci-e2e',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ci-e2e',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ci-e2e',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'ci-e2e',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'CREATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'default',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'flux',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'heatshrink',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'solderingIron',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'DELETE_FEATURE_STRATEGY',
                },
                {
                    project: 'cardboard_box',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'default',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'flux',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'heatshrink',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
                {
                    project: 'solderingIron',
                    environment: 'ephemeral-staging-alpha',
                    permission: 'UPDATE_FEATURE_ENVIRONMENT',
                },
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
            {
                id: 'kill-switch',
                name: 'Kill switch',
                description:
                    'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.',
                lifetimeDays: null,
            },
            {
                id: 'permission',
                name: 'Permission',
                description:
                    'Permission feature toggles are used to control permissions in your system.',
                lifetimeDays: null,
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
                displayName: 'Gradual rollout',
                name: 'flexibleRollout',
                editable: false,
                description:
                    'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.',
                parameters: [
                    {
                        name: 'rollout',
                        type: 'percentage',
                        description: '',
                        required: false,
                    },
                    {
                        name: 'stickiness',
                        type: 'string',
                        description:
                            'Used define stickiness. Possible values: default, userId, sessionId, random',
                        required: true,
                    },
                    {
                        name: 'groupId',
                        type: 'string',
                        description:
                            'Used to define a activation groups, which allows you to correlate across feature toggles.',
                        required: true,
                    },
                ],
                deprecated: false,
            },
            {
                displayName: 'UserIDs',
                name: 'userWithId',
                editable: false,
                description:
                    'Enable the feature for a specific set of userIds.',
                parameters: [
                    {
                        name: 'userIds',
                        type: 'list',
                        description: '',
                        required: false,
                    },
                ],
                deprecated: false,
            },
            {
                displayName: 'IPs',
                name: 'remoteAddress',
                editable: false,
                description:
                    'Enable the feature for a specific set of IP addresses.',
                parameters: [
                    {
                        name: 'IPs',
                        type: 'list',
                        description:
                            'List of IPs to enable the feature toggle for.',
                        required: true,
                    },
                ],
                deprecated: false,
            },
            {
                displayName: 'Hosts',
                name: 'applicationHostname',
                editable: false,
                description:
                    'Enable the feature for a specific set of hostnames.',
                parameters: [
                    {
                        name: 'hostNames',
                        type: 'list',
                        description:
                            'List of hostnames to enable the feature toggle for.',
                        required: false,
                    },
                ],
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
            {
                displayName: null,
                name: 'gradualRolloutSessionId',
                editable: true,
                description:
                    'Gradually activate feature toggle. Stickiness based on session id.',
                parameters: [
                    {
                        name: 'percentage',
                        type: 'percentage',
                        description: '',
                        required: false,
                    },
                    {
                        name: 'groupId',
                        type: 'string',
                        description:
                            'Used to define a activation groups, which allows you to correlate across feature toggles.',
                        required: true,
                    },
                ],
                deprecated: true,
            },
            {
                displayName: null,
                name: 'gradualRolloutUserId',
                editable: true,
                description:
                    'Gradually activate feature toggle for logged in users. Stickiness based on user id.',
                parameters: [
                    {
                        name: 'percentage',
                        type: 'percentage',
                        description: '',
                        required: false,
                    },
                    {
                        name: 'groupId',
                        type: 'string',
                        description:
                            'Used to define a activation groups, which allows you to correlate across feature toggles.',
                        required: true,
                    },
                ],
                deprecated: true,
            },
        ],
        projects: [
            {
                name: 'Cardboard Box',
                id: 'cardboard_box',
                description: 'A thing to put other things into. Very useful.',
                health: 100,
                featureCount: 0,
                memberCount: 1,
                updatedAt: '2022-06-28T17:33:53.934Z',
            },
            {
                name: 'Default',
                id: 'default',
                description: 'Default project',
                health: 74,
                featureCount: 10,
                memberCount: 3,
                updatedAt: '2022-06-28T17:33:53.963Z',
            },
            {
                name: 'Flux',
                id: 'flux',
                description: '',
                health: 100,
                featureCount: 1,
                memberCount: 1,
                updatedAt: '2022-06-28T17:33:53.936Z',
            },
            {
                name: 'Heat Shrink',
                id: 'heatshrink',
                description: '',
                health: 100,
                featureCount: 0,
                memberCount: 1,
                updatedAt: '2022-06-28T17:33:53.937Z',
            },
            {
                name: 'Soldering Iron',
                id: 'solderingIron',
                description: '',
                health: 100,
                featureCount: 0,
                memberCount: 1,
                updatedAt: '2022-06-28T17:33:53.974Z',
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/bootstrapUiSchema', data),
    ).toBeUndefined();
});
