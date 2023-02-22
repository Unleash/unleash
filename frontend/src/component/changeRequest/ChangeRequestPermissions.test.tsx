import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FeatureView } from '../feature/FeatureView/FeatureView';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProvider } from '../providers/AccessProvider/AccessProvider';
import { AnnouncerProvider } from '../common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { testServerRoute, testServerSetup } from '../../utils/testServer';
import { UIProviderContainer } from '../providers/UIProvider/UIProviderContainer';
import { FC } from 'react';
import { IPermission } from '../../interfaces/user';

const server = testServerSetup();

const changeRequestsEnabledIn = (
    env: 'development' | 'production' | 'custom'
) =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: null,
                changeRequestEnabled: env === 'development',
            },
            {
                environment: 'production',
                type: 'production',
                requiredApprovals: 1,
                changeRequestEnabled: env === 'production',
            },
            {
                environment: 'custom',
                type: 'production',
                requiredApprovals: null,
                changeRequestEnabled: env === 'custom',
            },
        ]
    );

const uiConfigForEnterprise = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Open Source',
        flags: {
            changeRequests: true,
        },
        versionInfo: {
            current: { oss: '4.18.0-beta.5', enterprise: '4.17.0-beta.1' },
        },
        disablePasswordAuth: false,
    });

const setupOtherRoutes = (feature: string) => {
    testServerRoute(
        server,
        'api/admin/projects/default/change-requests/pending',
        []
    );
    testServerRoute(server, '/api/admin/projects/default', {});
    testServerRoute(server, `api/admin/client-metrics/features/${feature}`, {
        version: 1,
        maturity: 'stable',
        featureName: feature,
        lastHourUsage: [],
        seenApplications: [],
    });
    testServerRoute(server, `api/admin/features/${feature}/tags`, {
        version: 1,
        tags: [],
    });
    testServerRoute(server, `api/admin/strategies`, {
        version: 1,
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
        ],
    });
};

const userHasPermissions = (permissions: Array<IPermission>) => {
    testServerRoute(server, 'api/admin/user', {
        user: {
            isAPI: false,
            id: 2,
            name: 'Test',
            email: 'test@getunleash.ai',
            imageUrl:
                'https://gravatar.com/avatar/e55646b526ff342ff8b43721f0cbdd8e?size=42&default=retro',
            seenAt: '2022-11-29T08:21:52.581Z',
            loginAttempts: 0,
            createdAt: '2022-11-21T10:10:33.074Z',
        },
        permissions,
        feedback: [],
        splash: {},
    });
};

const featureEnvironments = (
    feature: string,
    environments: Array<{ name: string; strategies: Array<string> }>
) => {
    testServerRoute(server, `/api/admin/projects/default/features/${feature}`, {
        environments: environments.map(env => ({
            name: env.name,
            enabled: false,
            type: 'production',
            sortOrder: 1,
            strategies: env.strategies.map(strategy => ({
                name: strategy,
                id: Math.random(),
                constraints: [],
                parameters: [],
                sortOrder: 1,
            })),
        })),
        name: feature,
        impressionData: false,
        description: '',
        project: 'default',
        stale: false,
        variants: [],
        createdAt: '2022-11-14T08:16:33.338Z',
        lastSeenAt: null,
        type: 'release',
        archived: false,
    });
};

const UnleashUiSetup: FC<{ path: string; pathTemplate: string }> = ({
    children,
    path,
    pathTemplate,
}) => (
    <UIProviderContainer>
        <AccessProvider>
            <MemoryRouter initialEntries={[path]}>
                <ThemeProvider>
                    <AnnouncerProvider>
                        <Routes>
                            <Route path={pathTemplate} element={children} />
                        </Routes>
                    </AnnouncerProvider>
                </ThemeProvider>
            </MemoryRouter>
        </AccessProvider>
    </UIProviderContainer>
);

const strategiesAreDisplayed = async (
    firstStrategy: string,
    secondStrategy: string
) => {
    await screen.findByText(firstStrategy);
    await screen.findByText(secondStrategy);
};

const deleteButtonsActiveInChangeRequestEnv = async () => {
    const deleteButtons = screen.getAllByTestId('STRATEGY_FORM_REMOVE_ID');
    expect(deleteButtons.length).toBe(2);

    // wait for change request config to be loaded
    await waitFor(() => {
        // production
        const productionStrategyDeleteButton = deleteButtons[0];
        expect(productionStrategyDeleteButton).not.toBeDisabled();
    });
    await waitFor(() => {
        // custom env
        const customEnvStrategyDeleteButton = deleteButtons[1];
        expect(customEnvStrategyDeleteButton).toBeDisabled();
    });
};

const copyButtonsActiveInOtherEnv = async () => {
    const copyButtons = screen.getAllByTestId('STRATEGY_FORM_COPY_ID');
    expect(copyButtons.length).toBe(2);

    // production
    const productionStrategyCopyButton = copyButtons[0];
    expect(productionStrategyCopyButton).toBeDisabled();

    // custom env
    const customEnvStrategyCopyButton = copyButtons[1];
    expect(customEnvStrategyCopyButton).not.toBeDisabled();
};

test('user without priviledges can only perform change requests actions', async () => {
    const project = 'default';
    const featureName = 'test';
    featureEnvironments(featureName, [
        { name: 'development', strategies: [] },
        { name: 'production', strategies: ['userWithId'] },
        { name: 'custom', strategies: ['default'] },
    ]);
    userHasPermissions([
        {
            project,
            environment: 'production',
            permission: 'APPLY_CHANGE_REQUEST',
        },
    ]);
    changeRequestsEnabledIn('production');
    uiConfigForEnterprise();
    setupOtherRoutes(featureName);

    render(
        <UnleashUiSetup
            pathTemplate="/projects/:projectId/features/:featureId/*"
            path={`/projects/${project}/features/${featureName}`}
        >
            <FeatureView />
        </UnleashUiSetup>
    );

    await strategiesAreDisplayed('UserIDs', 'Standard');
    await deleteButtonsActiveInChangeRequestEnv();
    await copyButtonsActiveInOtherEnv();
});
