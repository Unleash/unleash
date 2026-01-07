import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { FeatureChange } from './FeatureChange.tsx';
import type {
    ChangeRequestState,
    ChangeRequestType,
    IChangeRequestFeature,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';

describe('Schedule conflicts', () => {
    const change = {
        id: 15,
        action: 'deleteStrategy' as const,
        payload: {
            id: 'b3ac8595-8ad3-419e-aa18-4d82f2b6bc4c',
            name: 'flexibleRollout',
        },
        createdAt: new Date(),
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl: '',
        },
        scheduleConflicts: {
            changeRequests: [
                {
                    id: 73,
                },
                {
                    id: 80,
                    title: 'Adjust rollout percentage',
                },
            ],
        },
    };

    const feature = (change: IFeatureChange): IChangeRequestFeature => ({
        name: 'conflict-test',
        changes: [change],
    });

    const changeRequest =
        (feature: IChangeRequestFeature) =>
        (state: ChangeRequestState): ChangeRequestType => {
            const shared = {
                id: 1,
                title: '',
                project: 'default',
                environment: 'default',
                minApprovals: 1,
                createdBy: { id: 1, username: 'user1', imageUrl: '' },
                createdAt: new Date(),
                features: [feature],
                segments: [],
                approvals: [],
                rejections: [],
                comments: [],
            };

            if (state === 'Scheduled') {
                return {
                    ...shared,
                    state,
                    schedule: {
                        scheduledAt: '2024-01-12T09:46:51+05:30',
                        status: 'pending',
                    },
                };
            }

            return {
                ...shared,
                state,
            };
        };

    it.each([
        'Draft',
        'Scheduled',
        'In review',
        'Approved',
    ])('should show schedule conflicts (when they exist) for change request in the %s state', async (changeRequestState) => {
        const flag = feature(change);
        render(
            <FeatureChange
                actions={null}
                index={0}
                changeRequest={changeRequest(flag)(
                    changeRequestState as ChangeRequestState,
                )}
                change={change}
                feature={flag}
            />,
        );

        const alert = await screen.findByRole('alert');

        expect(
            alert.textContent!.startsWith('Potential conflict'),
        ).toBeTruthy();

        const links = await screen.findAllByRole('link');

        expect(links).toHaveLength(
            change.scheduleConflicts.changeRequests.length,
        );

        const [link1, link2] = links;

        expect(link1).toHaveTextContent('#73');
        expect(link1).toHaveAccessibleDescription('Change request 73');
        expect(link1).toHaveAttribute(
            'href',
            `/projects/default/change-requests/73`,
        );

        expect(link2).toHaveTextContent('#80 (Adjust rollout percentage)');
        expect(link2).toHaveAccessibleDescription('Change request 80');
        expect(link2).toHaveAttribute(
            'href',
            `/projects/default/change-requests/80`,
        );
    });

    it.each([
        'Draft',
        'Scheduled',
        'In review',
        'Approved',
    ])('should not show schedule conflicts when they do not exist for change request in the %s state', async (changeRequestState) => {
        const { scheduleConflicts, ...changeWithNoScheduleConflicts } = change;

        const flag = feature(changeWithNoScheduleConflicts);

        render(
            <FeatureChange
                actions={null}
                index={0}
                changeRequest={changeRequest(flag)(
                    changeRequestState as ChangeRequestState,
                )}
                change={changeWithNoScheduleConflicts}
                feature={flag}
            />,
        );

        const links = screen.queryByRole('link');

        expect(links).toBe(null);

        const alert = screen.queryByRole('alert');

        expect(alert).toBe(null);
    });
});
