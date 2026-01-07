import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FeatureView } from '../feature/FeatureView/FeatureView.tsx';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProvider } from '../providers/AccessProvider/AccessProvider.tsx';
import { AnnouncerProvider } from '../common/Announcer/AnnouncerProvider/AnnouncerProvider.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { UIProviderContainer } from '../providers/UIProvider/UIProviderContainer.tsx';
import type React from 'react';
import type { FC } from 'react';
import type { IPermission } from 'interfaces/user';
import { SWRConfig } from 'swr';
import type { ProjectMode } from '../project/Project/hooks/useProjectEnterpriseSettingsForm.ts';
import { StickyProvider } from 'component/common/Sticky/StickyProvider';
import { HighlightProvider } from 'component/common/Highlight/HighlightProvider';

const server = testServerSetup();

const projectWithCollaborationMode = (mode: ProjectMode) =>
    testServerRoute(server, '/api/admin/projects/default/overview', { mode });

const changeRequestsEnabledIn = (
    env: 'development' | 'production' | 'custom',
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
        ],
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
        [],
    );
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
    testServerRoute(server, `api/admin/tag-types`, {
        tagTypes: [],
        version: 1,
    });
    testServerRoute(server, `api/admin/tags/simple`, {
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
                displayName: 'Gradual rollout',
                name: 'flexibleRollout',
                editable: false,
                description:
                    'The gradual rollout strategy allows you to gradually roll out a feature to a percentage of users.',
                parameters: [
                    {
                        name: 'rollout',
                    },
                    {
                        name: 'stickiness',
                    },
                    {
                        name: 'groupId',
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
const userIsMemberOfProjects = (projects: string[]) => {
    userHasPermissions(
        projects.map((project) => ({
            project,
            environment: 'irrelevant',
            permission: 'irrelevant',
        })),
    );
};

const featureEnvironments = (
    feature: string,
    environments: Array<{ name: string; strategies: Array<string> }>,
) => {
    testServerRoute(server, `/api/admin/projects/default/features/${feature}`, {
        environments: environments.map((env) => ({
            name: env.name,
            enabled: false,
            type: 'production',
            sortOrder: 1,
            strategies: env.strategies.map((strategy) => ({
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
        children: [],
        dependencies: [],
    });
};

const UnleashUiSetup: FC<{
    path: string;
    pathTemplate: string;
    children?: React.ReactNode;
}> = ({ children, path, pathTemplate }) => (
    <SWRConfig
        value={{
            provider: () => new Map(),
            isVisible() {
                return true;
            },
        }}
    >
        <UIProviderContainer>
            <AccessProvider>
                <MemoryRouter initialEntries={[path]}>
                    <ThemeProvider>
                        <AnnouncerProvider>
                            <StickyProvider>
                                <HighlightProvider>
                                    <Routes>
                                        <Route
                                            path={pathTemplate}
                                            element={children}
                                        />
                                    </Routes>
                                </HighlightProvider>
                            </StickyProvider>
                        </AnnouncerProvider>
                    </ThemeProvider>
                </MemoryRouter>
            </AccessProvider>
        </UIProviderContainer>
    </SWRConfig>
);

const strategiesAreDisplayed = async (strategies: string[]) => {
    for (const strategy of strategies) {
        await screen.findByText(strategy);
    }
};

const getDeleteButtons = async () => {
    const removeMenus = screen.getAllByTestId(`STRATEGY_REMOVE_MENU_BTN`);
    const deleteButtons: HTMLElement[] = [];

    await Promise.all(
        removeMenus.map(async (menu) => {
            fireEvent.click(menu);
            const removeButton = await screen.findAllByTestId(
                'STRATEGY_FORM_REMOVE_ID',
            );
            deleteButtons.push(...removeButton);
        }),
    );
    return deleteButtons;
};

const deleteButtonsActiveInChangeRequestEnv = async () => {
    const deleteButtons = await getDeleteButtons();
    expect(deleteButtons.length).toBe(3);

    // wait for change request config to be loaded
    await waitFor(() => {
        // production
        const productionStrategyDeleteButton = deleteButtons[1];
        expect(productionStrategyDeleteButton).not.toHaveClass('Mui-disabled');
    });
    await waitFor(() => {
        // custom env
        const customEnvStrategyDeleteButton = deleteButtons[2];
        expect(customEnvStrategyDeleteButton).toHaveClass('Mui-disabled');
    });
};

const deleteButtonsInactiveInChangeRequestEnv = async () => {
    const deleteButtons = await getDeleteButtons();
    expect(deleteButtons.length).toBe(3);

    // wait for change request config to be loaded
    await waitFor(() => {
        // production
        const productionStrategyDeleteButton = deleteButtons[1];
        expect(productionStrategyDeleteButton).toHaveClass('Mui-disabled');
    });
    await waitFor(() => {
        // custom env
        const customEnvStrategyDeleteButton = deleteButtons[2];
        expect(customEnvStrategyDeleteButton).toHaveClass('Mui-disabled');
    });
};

const copyButtonsActiveInOtherEnv = async () => {
    const copyButtons = await screen.findAllByTestId('STRATEGY_FORM_COPY_ID');
    expect(copyButtons.length).toBe(2);

    // production
    const productionStrategyCopyButton = copyButtons[0];
    expect(productionStrategyCopyButton).toBeEnabled();

    // custom env
    const customEnvStrategyCopyButton = copyButtons[1];
    expect(customEnvStrategyCopyButton).not.toBeDisabled();
};

const openEnvironments = async (envNames: string[]) => {
    for (const env of envNames) {
        const environmentHeader = await screen.findByRole('heading', {
            name: env,
        });
        fireEvent.click(environmentHeader);
    }
};

test('open mode + non-project member can perform basic change request actions', async () => {
    const project = 'default';
    const featureName = 'test';
    featureEnvironments(featureName, [
        { name: 'development', strategies: [] },
        { name: 'production', strategies: ['flexibleRollout'] },
        { name: 'custom', strategies: ['default'] },
    ]);
    userIsMemberOfProjects([]);
    changeRequestsEnabledIn('production');
    projectWithCollaborationMode('open');
    uiConfigForEnterprise();
    setupOtherRoutes(featureName);

    render(
        <UnleashUiSetup
            pathTemplate='/projects/:projectId/features/:featureId/*'
            path={`/projects/${project}/features/${featureName}`}
        >
            <FeatureView />
        </UnleashUiSetup>,
    );
    await openEnvironments(['development', 'production', 'custom']);

    await strategiesAreDisplayed(['Gradual rollout', 'Standard']);
    await deleteButtonsActiveInChangeRequestEnv();
    await copyButtonsActiveInOtherEnv();
});

test('protected mode + project member can perform basic change request actions', async () => {
    const project = 'default';
    const featureName = 'test';
    featureEnvironments(featureName, [
        { name: 'development', strategies: [] },
        { name: 'production', strategies: ['flexibleRollout'] },
        { name: 'custom', strategies: ['default'] },
    ]);
    userIsMemberOfProjects([project]);
    changeRequestsEnabledIn('production');
    projectWithCollaborationMode('protected');
    uiConfigForEnterprise();
    setupOtherRoutes(featureName);

    render(
        <UnleashUiSetup
            pathTemplate='/projects/:projectId/features/:featureId/*'
            path={`/projects/${project}/features/${featureName}`}
        >
            <FeatureView />
        </UnleashUiSetup>,
    );

    await openEnvironments(['development', 'production', 'custom']);

    await strategiesAreDisplayed(['Gradual rollout', 'Standard']);
    await deleteButtonsActiveInChangeRequestEnv();
    await copyButtonsActiveInOtherEnv();
});

test.skip('protected mode + non-project member cannot perform basic change request actions', async () => {
    const project = 'default';
    const featureName = 'test';
    featureEnvironments(featureName, [
        { name: 'development', strategies: [] },
        { name: 'production', strategies: ['flexibleRollout'] },
        { name: 'custom', strategies: ['default'] },
    ]);
    userIsMemberOfProjects([]);
    changeRequestsEnabledIn('production');
    projectWithCollaborationMode('protected');
    uiConfigForEnterprise();
    setupOtherRoutes(featureName);

    render(
        <UnleashUiSetup
            pathTemplate='/projects/:projectId/features/:featureId/*'
            path={`/projects/${project}/features/${featureName}`}
        >
            <FeatureView />
        </UnleashUiSetup>,
    );

    await openEnvironments(['development', 'production', 'custom']);

    await strategiesAreDisplayed(['Gradual rollout', 'Standard']);
    await deleteButtonsInactiveInChangeRequestEnv();
    await copyButtonsActiveInOtherEnv();
});
