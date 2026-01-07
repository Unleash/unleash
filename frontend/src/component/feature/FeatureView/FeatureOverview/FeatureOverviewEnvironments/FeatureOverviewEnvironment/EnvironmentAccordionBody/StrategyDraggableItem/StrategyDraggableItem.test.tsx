import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { vi } from 'vitest';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import type {
    ChangeRequestType,
    ChangeRequestAction,
} from 'component/changeRequest/changeRequest.types';
import { ProjectEnvironmentStrategyDraggableItem } from './ProjectEnvironmentStrategyDraggableItem.tsx';

const server = testServerSetup();

const strategy = {
    name: 'flexibleRollout',
    constraints: [],
    variants: [],
    parameters: {
        groupId: 'CR-toggle',
        rollout: '100',
        stickiness: 'default',
    },
    sortOrder: 0,
    id: 'b6363cc8-ad8e-478a-b464-484bbd3b31f6',
    title: '',
    disabled: false,
};

const draftRequest = (
    action: Omit<ChangeRequestAction, 'updateSegment'> = 'updateStrategy',
    createdBy = 1,
): ChangeRequestType => {
    return {
        id: 71,
        title: 'Change request #71',
        environment: 'production',
        minApprovals: 1,
        project: 'dafault',
        createdBy: {
            id: createdBy,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
        createdAt: new Date('2023-11-08T10:28:47.183Z'),
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 84,
                        action: action as any,
                        payload: {
                            id: 'b6363cc8-ad8e-478a-b464-484bbd3b31f6',
                            name: 'flexibleRollout',
                            title: '',
                            disabled: false,
                            segments: [],
                            variants: [],
                            parameters: {
                                groupId: 'CR-toggle',
                                rollout: '15',
                                stickiness: 'default',
                            },
                            constraints: [],
                        },
                        createdAt: new Date('2023-11-08T10:28:47.183Z'),
                        createdBy: {
                            id: 1,
                            username: 'admin',
                            imageUrl:
                                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
                        },
                    },
                ],
            },
        ],
        segments: [],
        approvals: [],
        rejections: [],
        comments: [],
        state: 'In review',
    };
};

const scheduledRequest = (
    action: Omit<ChangeRequestAction, 'updateSegment'>,
) => ({
    ...draftRequest(action),
    state: 'Scheduled',
    schedule: {
        scheduledAt: new Date().toISOString(),
        status: 'pending',
    },
});

const uiConfig = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
    });
};

const user = () => {
    testServerRoute(server, '/api/admin/user', {
        user: {
            isAPI: false,
            id: 1,
            name: 'Some User',
            email: 'user@example.com',
            imageUrl:
                'https://gravatar.com/avatar/8aa1132e102345f8c79322340e15340?size=42&default=retro',
            seenAt: '2022-11-28T14:55:18.982Z',
            loginAttempts: 0,
            createdAt: '2022-11-23T13:31:17.061Z',
        },
        permissions: [{ permission: ADMIN }],
        feedback: [],
        splash: {},
    });
};
const changeRequestConfig = () =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                changeRequestEnabled: false,
            },
            {
                environment: 'production',
                type: 'production',
                changeRequestEnabled: true,
            },
        ],
        'get',
    );

const feature = () => {
    testServerRoute(server, '/api/admin/projects/default/features/feature1', {
        environments: [
            {
                name: 'development',
                lastSeenAt: null,
                variants: [],
                enabled: false,
                type: 'development',
                sortOrder: 2,
                strategies: [],
            },
            {
                name: 'production',
                lastSeenAt: null,
                variants: [],
                enabled: false,
                type: 'production',
                sortOrder: 3,
                strategies: [
                    {
                        name: 'flexibleRollout',
                        constraints: [],
                        variants: [],
                        parameters: {
                            groupId: 'CR-toggle',
                            rollout: '100',
                            stickiness: 'default',
                        },
                        sortOrder: 0,
                        id: 'b6363cc8-ad8e-478a-b464-484bbd3b31f6',
                        title: '',
                        disabled: false,
                    },
                ],
            },
        ],
        name: 'feature1',
        favorite: false,
        impressionData: false,
        description: null,
        project: 'MyNewProject',
        stale: false,
        lastSeenAt: null,
        createdAt: '2023-11-01T10:11:58.505Z',
        type: 'release',
        variants: [],
        archived: false,
        dependencies: [],
        children: [],
    });
};

const setupOtherServerRoutes = () => {
    uiConfig();
    changeRequestConfig();
    user();
    feature();
};

beforeEach(() => {
    setupOtherServerRoutes();
});

const Component = () => {
    return (
        <>
            <Routes>
                <Route
                    path={'/projects/:projectId/features/:featureId'}
                    element={
                        <ProjectEnvironmentStrategyDraggableItem
                            strategy={strategy}
                            environmentName={'production'}
                            index={1}
                            onDragStartRef={vi.fn()}
                            onDragOver={vi.fn()}
                            onDragEnd={vi.fn()}
                        />
                    }
                />
            </Routes>
        </>
    );
};
describe('Change request badges for strategies', () => {
    test('should not render a badge if no changes', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        expect(screen.queryByText('Modified in draft')).toBe(null);
        expect(screen.queryByText('Changes Scheduled')).toBe(null);
    });

    test('should only render the "Modified in draft" badge when logged in user is the creator of change request', async () => {
        const changeRequest = draftRequest('updateStrategy', 5);

        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [changeRequest],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        expect(screen.queryByText('Modified in draft')).toBe(null);
    });

    test('should render a "Modified in draft" badge when "updateStrategy" action exists in "pending" change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [draftRequest('updateStrategy', 1)],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Modified in draft');
        expect(screen.queryByText('Changes Scheduled')).toBe(null);
    });

    test('should render a "Deleted in draft" badge when "deleteStrategy" action exists in "pending" change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [draftRequest('deleteStrategy', 1)],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Deleted in draft');
        expect(screen.queryByText('Changes Scheduled')).toBe(null);
    });

    test('should render a "Changes scheduled" badge when "updateStrategy" action exists in "Scheduled" change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [],
        );

        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/scheduled',
            [{ id: 1 }],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Changes Scheduled');
        expect(screen.queryByText('Modified in draft')).toBe(null);
    });

    test('should render a "Changes Scheduled" badge when "deleteStrategy" action exists in "Scheduled" change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [scheduledRequest('deleteStrategy')],
        );
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/scheduled',
            [{ id: 1 }],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Changes Scheduled');
        expect(screen.queryByText('Modified in draft')).toBe(null);
    });

    test('should render a both badges when "updateStrategy" action exists in "Scheduled" and pending change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [
                scheduledRequest('updateStrategy'),
                draftRequest('updateStrategy', 1),
            ],
        );
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/scheduled',
            [{ id: 1 }],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Changes Scheduled');
        await screen.findByText('Modified in draft');
    });

    test('should render a both badges when "deleteStrategy" action exists in "Scheduled" and pending change request', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [
                scheduledRequest('deleteStrategy'),
                draftRequest('deleteStrategy', 1),
            ],
        );
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/scheduled',
            [{ id: 1 }],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Changes Scheduled');
        await screen.findByText('Deleted in draft');
    });

    test('should render "Changes scheduled" badge if strategy is modified in a scheduled request event if change requests are disabled', async () => {
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/config',
            [
                {
                    environment: 'development',
                    type: 'development',
                    changeRequestEnabled: false,
                },
                {
                    environment: 'production',
                    type: 'production',
                    changeRequestEnabled: false,
                },
            ],
            'get',
        );
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/pending/feature1',
            [],
        );
        testServerRoute(
            server,
            '/api/admin/projects/default/change-requests/scheduled',
            [{ id: 1 }],
        );

        render(<Component />, {
            route: '/projects/default/features/feature1',
            permissions: [
                {
                    permission: ADMIN,
                },
            ],
        });

        await screen.findByText('Changes Scheduled');
    });
});
