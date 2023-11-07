import { screen } from "@testing-library/react";
import { testServerRoute, testServerSetup } from "utils/testServer";
import { ChangeRequestState, IChangeRequest } from "../changeRequest.types";
import { render } from "../../../utils/testRenderer";
import { ChangeRequestOverview } from "./ChangeRequestOverview";
import { ADMIN, APPLY_CHANGE_REQUEST } from "../../providers/AccessProvider/permissions";
import ToastRenderer from "../../common/ToastRenderer/ToastRenderer";
import { Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const getScheduleChangesButton = async (): Promise<HTMLElement> => {
    return screen.findByText('Schedule Changes' );
};

const getUpdateScheduleButton = async (): Promise<HTMLElement> => {
    return screen.findByText('Update Scheduled Time' );
};

const getApplyNowButton = async (): Promise<HTMLElement> => {
    return screen.findByRole('button', { name: 'Apply changes now' });
};

const verifyChangeRequestIsScheduled = async (): Promise<HTMLElement> => {
    return screen.findByText('Changes are scheduled to be applied on');
};

const verifyScheduleDialogIsVisible = async (): Promise<HTMLElement> => {
    return screen.findByRole('dialog', { name: 'Schedule changes' });
};

const verifyReScheduleDialogIsVisible = async (): Promise<HTMLElement> => {
    return screen.findByRole('dialog', { name: 'Update schedule' });
};

const verifyApplyScheduleDialogIsVisible = async (): Promise<HTMLElement> => {
    return screen.findByRole('dialog', { name: 'Apply changes' });
};

const verifyRejectScheduleDialogIsVisible = async (): Promise<HTMLElement> => {
    return screen.findByRole('dialog', { name: 'Reject changes' });
};

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
    testServerRoute(
      server,
      '/api/admin/projects/default/change-requests/config',
      [
          {
              environment: 'development',
              type: 'development',
              changeRequestEnabled: true,
          },
          {
              environment: 'production',
              type: 'production',
              changeRequestEnabled: true,
          },
      ],
    );
    const changeRequest =  mockChangeRequest(featureName, state);
    pendingChangeRequest(changeRequest)
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
        permissions: [{ permission: APPLY_CHANGE_REQUEST, project: 'default', environment: 'production' }],
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
    setupOtherServerRoutes();
    feature({ name: featureName, enabled: true })
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
    await userEvent.click(applyOrScheduleButton);

    const scheduleChangesButton = await screen.findAllByDisplayValue('Schedule Changes');
    console.log(scheduleChangesButton.map(x => x.innerHTML));
    // fireEvent.click(scheduleChangesButton);
    //
    // const dialog = await verifyScheduleDialogIsVisible();
    // const button = await within(dialog).findByRole('button', {
    //     name: 'Schedule changes',
    // });
    // fireEvent.click(button);
    // await verifyChangeRequestIsScheduled();
});

// it('should show scheduled change request details', async () => {
//     setupHttpRoutes('feature1', 'Scheduled');
//
//     render(
//         <Routes>
//             <Route
//                 path={
//                     '/projects/:projectId/change-requests/changeRequestId'
//                 }
//                 element={<ChangeRequestOverview />}
//             />
//         </Routes>,
//         {
//             route: '/projects/default/change-requests/68',
//             permissions: [{ permission: 'ADMIN' }],
//         },
//     );
//
//     await verifyChangeRequestIsScheduled();
// });
//
// it('should show an apply dialog when change request is scheduled and apply is selected', async () => {
//     setupHttpRoutes('feature1', 'Scheduled');
//
//     render(
//         <Routes>
//             <Route
//                 path={
//                     '/projects/:projectId/change-requests/changeRequestId'
//                 }
//                 element={<ChangeRequestOverview />}
//             />
//         </Routes>,
//         {
//             route: '/projects/default/change-requests/68',
//             permissions: [{ permission: 'ADMIN' }],
//         },
//     );
//
//     const applyOrScheduleButton = await screen.findByText(
//         'Apply or scheduled changes',
//     );
//     fireEvent.click(applyOrScheduleButton);
//
//     const applyNowButton = await getApplyNowButton();
//     fireEvent.click(applyNowButton);
//
//     await verifyApplyScheduleDialogIsVisible();
// });
//
// it('should show a reschedule dialog when change request is scheduled and update schedule is selected', async () => {
//     setupHttpRoutes('feature1', 'Scheduled');
//
//     render(
//         <Routes>
//             <Route
//                 path={
//                     '/projects/:projectId/change-requests/changeRequestId'
//                 }
//                 element={<ChangeRequestOverview />}
//             />
//         </Routes>,
//         {
//             route: '/projects/default/change-requests/68',
//             permissions: [
//                 { permission: APPLY_CHANGE_REQUEST, project: 'default' },
//             ],
//         },
//     );
//
//     const applyOrScheduleButton = await screen.findByText(
//         'Apply or scheduled changes',
//     );
//     fireEvent.click(applyOrScheduleButton);
//
//     const updateScheduleButton = await getUpdateScheduleButton();
//     fireEvent.click(updateScheduleButton);
//
//     await verifyReScheduleDialogIsVisible();
// });
//
// it('should show a reject dialog when change request is scheduled and reject is selected', async () => {
//     setupHttpRoutes('feature1', 'Scheduled');
//
//     render(
//         <Routes>
//             <Route
//                 path={
//                     '/projects/:projectId/change-requests/changeRequestId'
//                 }
//                 element={<ChangeRequestOverview />}
//             />
//         </Routes>,
//         {
//             route: '/projects/default/change-requests/68',
//             permissions: [{ permission: 'ADMIN' }],
//         },
//     );
//
//     const rejectButton = await screen.findByText('Reject changes');
//     fireEvent.click(rejectButton);
//
//     await verifyRejectScheduleDialogIsVisible();
// });
