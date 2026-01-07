import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type {
    ChangeRequestState,
    ChangeRequestType,
} from '../changeRequest.types';
import { render } from 'utils/testRenderer';
import { ChangeRequestOverview } from './ChangeRequestOverview.tsx';
import {
    ADMIN,
    APPLY_CHANGE_REQUEST,
} from 'component/providers/AccessProvider/permissions';
import { Route, Routes } from 'react-router-dom';

const server = testServerSetup();
const mockChangeRequest = (
    featureName: string,
    state: ChangeRequestState,
    failureReason?: string,
): ChangeRequestType => {
    const shared: Omit<ChangeRequestType, 'state' | 'schedule'> = {
        id: 1,
        environment: 'production',
        minApprovals: 1,
        project: 'default',
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        },
        createdAt: new Date('2022-12-02T09:19:12.242Z'),
        segments: [],
        title: '',
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
                        createdAt: new Date('2022-12-02T09:19:12.245Z'),
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
        rejections: [],
        comments: [],
    };

    if (state === 'Scheduled') {
        if (failureReason) {
            return {
                ...shared,
                state,
                schedule: {
                    scheduledAt: '2022-12-02T09:19:12.242Z',
                    status: 'failed',
                    reason: failureReason,
                },
            };
        }
        return {
            ...shared,
            state,
            schedule: {
                scheduledAt: '2022-12-02T09:19:12.242Z',
                status: 'pending',
            },
        };
    }

    return {
        ...shared,
        state,
    };
};
const pendingChangeRequest = (changeRequest: ChangeRequestType) =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending',
        [changeRequest],
    );

const changeRequest = (changeRequest: ChangeRequestType) =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/1',
        changeRequest,
        'get',
    );

const updateChangeRequestState = () =>
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/1/state',
        {},
        'post',
    );
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

const setupChangeRequest = (
    featureName: string,
    state: ChangeRequestState,
    overrides: Partial<Omit<ChangeRequestType, 'state' | 'schedule'>> = {},
) => {
    pendingChangeRequest({
        ...mockChangeRequest(featureName, state),
        ...overrides,
    });
    changeRequest({ ...mockChangeRequest(featureName, state), ...overrides });
};
const uiConfig = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: {},
    });
};

const user = () => {
    testServerRoute(server, '/api/admin/user', {
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
        permissions: [{ permission: ADMIN }],
        feedback: [],
        splash: {},
    });
};

const setupHttpRoutes = () => {
    uiConfig();
    changeRequestConfig();
    user();
    updateChangeRequestState();
};

beforeEach(() => {
    setupHttpRoutes();
});

const Component = () => {
    return (
        <>
            <Routes>
                <Route
                    path={'/projects/:projectId/change-requests/:id'}
                    element={<ChangeRequestOverview />}
                />
            </Routes>
        </>
    );
};

const featureName = 'feature1';

test('should allow scheduling of approved change request and show the schedule dialog', async () => {
    setupChangeRequest(featureName, 'Approved');

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [
            {
                permission: APPLY_CHANGE_REQUEST,
                project: 'default',
                environment: 'production',
            },
        ],
    });

    const applyOrScheduleButton = await screen.findByText(
        'Apply or schedule changes',
    );
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), {
        timeout: 3000,
    });

    fireEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findByRole('menuitem', {
        name: 'Schedule changes',
    });

    fireEvent.click(scheduleChangesButton);

    await screen.findByRole('dialog', { name: 'Schedule changes' });

    await screen.findByText('Preview changes');
});

test('should show a reschedule dialog when change request is scheduled and update schedule is selected', async () => {
    setupChangeRequest(featureName, 'Scheduled');
    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [
            {
                permission: APPLY_CHANGE_REQUEST,
                project: 'default',
                environment: 'production',
            },
        ],
    });

    const applyOrScheduleButton = await screen.findByText(
        'Apply or schedule changes',
    );
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), {
        timeout: 3000,
    });
    fireEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findByRole('menuitem', {
        name: 'Update schedule',
    });
    await screen.findByText('Preview changes');

    fireEvent.click(scheduleChangesButton);

    await screen.findByRole('dialog', { name: 'Update schedule' });
});

test('should be allowed to apply your own change request if it is approved', async () => {
    setupChangeRequest(featureName, 'Approved', {
        createdBy: {
            id: 17,
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        },
    });

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [
            {
                permission: APPLY_CHANGE_REQUEST,
                project: 'default',
                environment: 'production',
            },
        ],
    });

    const applyOrScheduleButton = await screen.findByText(
        'Apply or schedule changes',
    );
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), {
        timeout: 3000,
    });

    fireEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findByRole('menuitem', {
        name: 'Schedule changes',
    });

    fireEvent.click(scheduleChangesButton);

    await screen.findByRole('dialog', { name: 'Schedule changes' });
});

test('should show an apply dialog when change request is scheduled and apply is selected', async () => {
    setupChangeRequest(featureName, 'Scheduled');

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [
            {
                permission: APPLY_CHANGE_REQUEST,
                project: 'default',
                environment: 'production',
            },
        ],
    });

    const applyOrScheduleButton = await screen.findByText(
        'Apply or schedule changes',
    );
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), {
        timeout: 3000,
    });
    fireEvent.click(applyOrScheduleButton);

    const applyChangesButton = await screen.findByRole('menuitem', {
        name: 'Apply changes',
    });
    fireEvent.click(applyChangesButton);

    await screen.findByRole('dialog', { name: 'Apply changes' });
});

test('should show a reject dialog when change request is scheduled and Reject Changes button is clicked', async () => {
    setupChangeRequest(featureName, 'Scheduled');

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [{ permission: ADMIN }],
    });

    const applyOrScheduleButton = await screen.findByText(
        'Apply or schedule changes',
    );
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), {
        timeout: 3000,
    });

    const buttons = await screen.findAllByRole('button');
    const rejectChangesButton = buttons[buttons.length - 1];
    expect(
        within(rejectChangesButton).getByText('Reject changes'),
    ).toBeInTheDocument();
    fireEvent.click(rejectChangesButton);

    await screen.findByRole('dialog', {
        name: 'Reject changes',
    });
});
