import { FC } from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'themes/ThemeProvider';
import { MainLayout } from 'component/layout/MainLayout/MainLayout';
import { FeatureView } from '../feature/FeatureView/FeatureView';
import { AccessProvider } from '../providers/AccessProvider/AccessProvider';
import { AnnouncerProvider } from '../common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { testServerRoute, testServerSetup } from '../../utils/testServer';
import { UIProviderContainer } from '../providers/UIProvider/UIProviderContainer';

const server = testServerSetup();

const pendingChangeRequest = (featureName: string) =>
    testServerRoute(
        server,
        'api/admin/projects/default/change-requests/pending',
        [
            {
                id: 156,
                environment: 'production',
                state: 'Draft',
                minApprovals: 1,
                project: 'default',
                createdBy: {
                    id: 1,
                    username: 'admin',
                    imageUrl:
                        'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
                },
                createdAt: '2022-12-02T09:19:12.242Z',
                features: [
                    {
                        name: featureName,
                        changes: [
                            {
                                id: 292,
                                action: 'addStrategy',
                                payload: {
                                    name: 'default',
                                    segments: [],
                                    parameters: {},
                                    constraints: [],
                                },
                                createdAt: '2022-12-02T09:19:12.245Z',
                                createdBy: {
                                    id: 1,
                                    username: 'admin',
                                    imageUrl:
                                        'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
                                },
                            },
                        ],
                    },
                ],
                approvals: [],
                comments: [],
            },
        ]
    );

const changeRequestsEnabledIn = (env: string) =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                changeRequestEnabled: env === 'development',
            },
            {
                environment: 'production',
                type: 'production',
                changeRequestEnabled: env === 'production',
            },
        ]
    );

const uiConfigForEnterprise = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Open Source',
        flags: {
            changeRequests: true,
        },
        slogan: 'getunleash.io - All rights reserved',
        name: 'Unleash enterprise',
        links: [
            {
                value: 'Documentation',
                icon: 'library_books',
                href: 'https://docs.getunleash.io/docs',
                title: 'User documentation',
            },
            {
                value: 'GitHub',
                icon: 'c_github',
                href: 'https://github.com/Unleash/unleash',
                title: 'Source code on GitHub',
            },
        ],
        version: '4.18.0-beta.5',
        emailEnabled: false,
        unleashUrl: 'http://localhost:4242',
        baseUriPath: '',
        authenticationType: 'enterprise',
        segmentValuesLimit: 100,
        strategySegmentsLimit: 5,
        frontendApiOrigins: ['*'],
        versionInfo: {
            current: { oss: '4.18.0-beta.5', enterprise: '4.17.0-beta.1' },
            latest: {},
            isLatest: true,
            instanceId: 'c7566052-15d7-4e09-9625-9c988e1f2be7',
        },
        disablePasswordAuth: false,
    });

const featureList = (featureName: string) =>
    testServerRoute(server, '/api/admin/projects/default', {
        name: 'Default',
        description: 'Default project',
        health: 100,
        updatedAt: '2022-11-14T10:15:59.228Z',
        environments: ['development', 'production'],
        features: [
            {
                type: 'release',
                name: featureName,
                createdAt: '2022-11-14T08:16:33.338Z',
                lastSeenAt: null,
                stale: false,
                environments: [
                    {
                        name: 'development',
                        enabled: false,
                        type: 'development',
                        sortOrder: 100,
                    },
                    {
                        name: 'production',
                        enabled: false,
                        type: 'production',
                        sortOrder: 200,
                    },
                ],
            },
        ],
        members: 0,
        version: 1,
    });

const feature = ({ name, enabled }: { name: string; enabled: boolean }) =>
    testServerRoute(server, `/api/admin/projects/default/features/${name}`, {
        environments: [
            {
                name: 'development',
                enabled: false,
                type: 'development',
                sortOrder: 100,
                strategies: [],
            },
            {
                name: 'production',
                enabled,
                type: 'production',
                sortOrder: 200,
                strategies: [],
            },
        ],
        name,
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

const otherRequests = (feature: string) => {
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
    testServerRoute(server, 'api/admin/user', {
        user: {
            isAPI: false,
            id: 17,
            name: 'Some User',
            email: 'user@example.com',
            imageUrl:
                'https://gravatar.com/avatar/8aa1132e102345f8c79322340e15340?size=42&default=retro',
            seenAt: '2022-11-28T14:55:18.982Z',
            loginAttempts: 0,
            createdAt: '2022-11-23T13:31:17.061Z',
        },
        permissions: [{ permission: 'ADMIN' }],
        feedback: [],
        splash: {},
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
                            <Route
                                path={pathTemplate}
                                element={<MainLayout>{children}</MainLayout>}
                            />
                        </Routes>
                    </AnnouncerProvider>
                </ThemeProvider>
            </MemoryRouter>
        </AccessProvider>
    </UIProviderContainer>
);

const setupHttpRoutes = ({
    featureName,
    enabled,
}: {
    featureName: string;
    enabled: boolean;
}) => {
    pendingChangeRequest(featureName);
    changeRequestsEnabledIn('production');
    uiConfigForEnterprise();
    featureList(featureName);
    feature({ name: featureName, enabled });
    otherRequests(featureName);
};

const verifyBannerForPendingChangeRequest = async () => {
    return screen.findByText('Change request mode', {}, { timeout: 5000 });
};

const changeToggle = async (environment: string) => {
    const featureToggleStatusBox = screen.getByTestId('feature-toggle-status');
    await within(featureToggleStatusBox).findByText(environment);
    const toggle = screen.getAllByRole('checkbox')[1];
    fireEvent.click(toggle);
};

const verifyChangeRequestDialog = async (bannerMainText: string) => {
    await screen.findByText('Your suggestion:');
    const message = screen.getByTestId('update-enabled-message').textContent;
    expect(message).toBe(bannerMainText);
};

test('add toggle change to pending change request', async () => {
    setupHttpRoutes({ featureName: 'test', enabled: false });

    render(
        <UnleashUiSetup
            pathTemplate="/projects/:projectId/features/:featureId/*"
            path="/projects/default/features/test"
        >
            <FeatureView />
        </UnleashUiSetup>
    );

    await verifyBannerForPendingChangeRequest();

    await changeToggle('production');

    await verifyChangeRequestDialog('Enable feature toggle test in production');
});
