import { testServerRoute, testServerSetup } from "utils/testServer";
import { render } from "utils/testRenderer";
import { StrategyDraggableItem } from "./StrategyDraggableItem";
import { vi } from "vitest";
import { ADMIN } from "component/providers/AccessProvider/permissions";
import { screen } from "@testing-library/dom";
import { Route, Routes } from "react-router-dom";

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

const draftUpdateChangeRequests = [
    {
        id: 71,
        title: 'Change request #71',
        environment: 'production',
        minApprovals: 1,
        project: 'dafault',
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
        createdAt: '2023-11-08T10:28:47.183Z',
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 84,
                        action: 'updateStrategy',
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
                        createdAt: '2023-11-08T10:28:47.183Z',
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
    },
];

const scheduledUpdateChangeRequests = [
    {
        id: 70,
        title: 'Change request #70',
        environment: 'production',
        minApprovals: 1,
        project: 'dafault',
        createdBy: {
            id: 17,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
        createdAt: '2023-11-08T10:14:04.503Z',
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 83,
                        action: 'updateStrategy',
                        payload: {
                            id: 'b6363cc8-ad8e-478a-b464-484bbd3b31f6',
                            name: 'flexibleRollout',
                            title: '',
                            disabled: false,
                            segments: [],
                            variants: [],
                            parameters: {
                                groupId: 'CR-toggle',
                                rollout: '51',
                                stickiness: 'default',
                            },
                            constraints: [],
                        },
                        createdAt: '2023-11-08T10:14:04.503Z',
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
        state: 'Scheduled',
        schedule: {
            scheduledAt: '2023-11-28T10:15:00.000Z',
            status: 'pending',
        },
    },
];

const draftDeleteChangeRequests = [
    {
        id: 71,
        title: 'Change request #71',
        environment: 'production',
        minApprovals: 1,
        project: 'dafault',
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl:
              'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
        createdAt: '2023-11-08T10:28:47.183Z',
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 84,
                        action: 'deleteStrategy',
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
                        createdAt: '2023-11-08T10:28:47.183Z',
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
    },
];

const scheduledDeleteChangeRequests = [
    {
        id: 70,
        title: 'Change request #70',
        environment: 'production',
        minApprovals: 1,
        project: 'dafault',
        createdBy: {
            id: 17,
            username: 'admin',
            imageUrl:
              'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
        createdAt: '2023-11-08T10:14:04.503Z',
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 83,
                        action: 'deleteStrategy',
                        payload: {
                            id: 'b6363cc8-ad8e-478a-b464-484bbd3b31f6',
                            name: 'flexibleRollout',
                            title: '',
                            disabled: false,
                            segments: [],
                            variants: [],
                            parameters: {
                                groupId: 'CR-toggle',
                                rollout: '51',
                                stickiness: 'default',
                            },
                            constraints: [],
                        },
                        createdAt: '2023-11-08T10:14:04.503Z',
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
        state: 'Scheduled',
        schedule: {
            scheduledAt: '2023-11-28T10:15:00.000Z',
            status: 'pending',
        },
    },
];

const uiConfig = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: {
            scheduledConfigurationChanges: true,
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
                        <StrategyDraggableItem
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
    expect(screen.queryByText('Modified in scheduled change')).toBe(null);
});

test('should only render the "Modified in draft" badge when logged in user is the creator of change request', async () => {
    const changeRequest = draftUpdateChangeRequests[0];
    const otherUserDraft = {
        ...changeRequest,
        createdBy: { ...changeRequest.createdBy, id: 5 },
    };

    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending/feature1',
        [otherUserDraft],
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
        draftUpdateChangeRequests,
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
    expect(screen.queryByText('Modified in scheduled change')).toBe(null);
});

test('should render a "Deleted in draft" badge when "deleteStrategy" action exists in "pending" change request', async () => {
    testServerRoute(
      server,
      '/api/admin/projects/default/change-requests/pending/feature1',
      draftDeleteChangeRequests,
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
    expect(screen.queryByText('Modified in scheduled change')).toBe(null);
});

test('should render a "Modified in scheduled change" badge when "updateStrategy" action exists in "Scheduled" change request', async () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending/feature1',
        scheduledUpdateChangeRequests,
    );

    render(<Component />, {
        route: '/projects/default/features/feature1',
        permissions: [
            {
                permission: ADMIN,
            },
        ],
    });

    await screen.findByText('Modified in scheduled change');
    expect(screen.queryByText('Modified in draft')).toBe(null);
});


test('should render a "Deleted in scheduled change" badge when "deleteStrategy" action exists in "Scheduled" change request', async () => {
    testServerRoute(
      server,
      '/api/admin/projects/default/change-requests/pending/feature1',
      scheduledDeleteChangeRequests,
    );

    render(<Component />, {
        route: '/projects/default/features/feature1',
        permissions: [
            {
                permission: ADMIN,
            },
        ],
    });

    await screen.findByText('Deleted in scheduled change');
    expect(screen.queryByText('Modified in draft')).toBe(null);
});

test('should render a both badges when "updateStrategy" action exists in "Scheduled" and pending change request', async () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending/feature1',
        [...scheduledUpdateChangeRequests, ...draftUpdateChangeRequests],
    );

    render(<Component />, {
        route: '/projects/default/features/feature1',
        permissions: [
            {
                permission: ADMIN,
            },
        ],
    });

    await screen.findByText('Modified in scheduled change');
    await screen.findByText('Modified in draft');
});


test('should render a both badges when "deleteStrategy" action exists in "Scheduled" and pending change request', async () => {
    testServerRoute(
      server,
      '/api/admin/projects/default/change-requests/pending/feature1',
      [...scheduledDeleteChangeRequests, ...draftDeleteChangeRequests],
    );

    render(<Component />, {
        route: '/projects/default/features/feature1',
        permissions: [
            {
                permission: ADMIN,
            },
        ],
    });

    await screen.findByText('Deleted in scheduled change');
    await screen.findByText('Deleted in draft');
});

