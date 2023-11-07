import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { testServerRoute, testServerSetup } from "utils/testServer";
import { ChangeRequestState, IChangeRequest } from "../changeRequest.types";
import { render } from "../../../utils/testRenderer";
import { ChangeRequestOverview } from "./ChangeRequestOverview";
import { ADMIN, APPLY_CHANGE_REQUEST } from "../../providers/AccessProvider/permissions";
import ToastRenderer from "../../common/ToastRenderer/ToastRenderer";
import { Route, Routes } from "react-router-dom";

const server = testServerSetup();

const mockChangeRequest = (
    featureName: string,
    state: ChangeRequestState,
): IChangeRequest => {
    let result: IChangeRequest = {
        id: 1,
        environment: 'production',
        state: state,
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
        result.schedule = {
            scheduledAt: '2022-12-02T09:19:12.242Z',
            status: 'pending',
        };
    }

    return result;
};
const pendingChangeRequest = (changeRequest: IChangeRequest) =>
  testServerRoute(
    server,
    '/api/admin/projects/default/change-requests/pending',
    [
        changeRequest
    ],
  );

const setupChangeRequest = (
    featureName: string,
    state: ChangeRequestState,
    newState: ChangeRequestState,
) => {
    const changeRequest =  mockChangeRequest(featureName, state);
    pendingChangeRequest(changeRequest)
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
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/1',
         changeRequest,
        'get',
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/1/state',
        mockChangeRequest(featureName, newState),
        'post',
    );
};
const setupOtherServerRoutes = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: {
            scheduledConfigurationChanges: true,
        },
    });

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
    testServerRoute(
      server,
      '/api/admin/projects/default',
      {},
      'get',
    );
};

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
      dependencies: [],
      children: [],
  });


const setupHttpRoutes = (
    featureName: string,
    state: ChangeRequestState,
    newState: ChangeRequestState,
) => {
    feature({ name: featureName, enabled: true })
    setupOtherServerRoutes();
    setupChangeRequest(featureName, state, newState);
};


const Component = () => {
    return (
        <>
            <ToastRenderer />
            <Routes>
                <Route
                    path={'/projects/:projectId/change-requests/:id'}
                    element={<ChangeRequestOverview />}
                />
            </Routes>
        </>
    );
};

test('should allow scheduling of approved change request and show the schedule dialog', async () => {
    setupHttpRoutes('feature1', 'Approved', 'Scheduled');

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [{ permission: APPLY_CHANGE_REQUEST, project: 'default', environment: 'production' }],
    });

    const applyOrScheduleButton = await screen.findByText('Apply or schedule changes');
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), { timeout: 3000 });

    fireEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findByRole('menuitem', { name: 'Schedule changes' });

    fireEvent.click(scheduleChangesButton);

    await screen.findByRole('dialog', { name: 'Schedule changes' });
});

test('should show a reschedule dialog when change request is scheduled and update schedule is selected', async () => {
    setupHttpRoutes('feature1', 'Scheduled', 'Scheduled');
    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [{ permission: APPLY_CHANGE_REQUEST, project: 'default', environment: 'production' }],
    });

    const applyOrScheduleButton = await screen.findByText('Apply or schedule changes');
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), { timeout: 3000 });
    fireEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findByRole('menuitem', { name: 'Update schedule' });

    fireEvent.click(scheduleChangesButton);

    await screen.findByRole('dialog', { name: 'Update schedule' });
});

test('should show an apply dialog when change request is scheduled and apply is selected', async () => {
    setupHttpRoutes('feature1', 'Scheduled', "Applied");

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [{ permission: APPLY_CHANGE_REQUEST, project: 'default', environment: 'production' }],
    });

    const applyOrScheduleButton = await screen.findByText('Apply or schedule changes');
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), { timeout: 3000 });
    fireEvent.click(applyOrScheduleButton);
    const menuItems = await screen.findAllByRole('menuitem');
    const applyChangesButton = menuItems[0];

    fireEvent.click(applyChangesButton);

    await screen.findByRole('dialog', { name: 'Apply changes' });
});

test('should show scheduled change request details', async () => {
    setupHttpRoutes('feature1', 'Scheduled', "Applied");

    render(<Component />, {
        route: '/projects/default/change-requests/1',
        permissions: [{ permission: ADMIN }],
    });

    const applyOrScheduleButton = await screen.findByText('Apply or schedule changes');
    await waitFor(() => expect(applyOrScheduleButton).toBeEnabled(), { timeout: 3000 });

    const buttons = await screen.findAllByRole('button');
    const rejectChangesButton = buttons[buttons.length -1];
    expect(within(rejectChangesButton).getByText('Reject changes')).toBeInTheDocument();
    fireEvent.click(rejectChangesButton);

    await screen.findByRole('dialog', { name: 'Reject changes' });
});
