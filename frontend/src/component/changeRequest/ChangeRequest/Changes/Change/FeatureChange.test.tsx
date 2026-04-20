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

describe('Consolidated milestone changes', () => {
    const makeConsolidatedChange = (id: number): IFeatureChange => ({
        id,
        action: 'changeMilestoneProgression' as const,
        payload: {
            sourceMilestone: `milestone-${id}`,
            targetMilestone: `milestone-${id + 1}`,
            transitionCondition: { intervalMinutes: 30 },
        },
        createdAt: new Date(),
        createdBy: { id: 1, username: 'admin', imageUrl: '' },
    });

    const change1 = makeConsolidatedChange(1);
    const change2 = makeConsolidatedChange(2);
    const change3 = makeConsolidatedChange(3);

    const multiChangeFeature: IChangeRequestFeature = {
        name: 'milestone-test',
        changes: [change1, change2, change3],
    };

    const changeRequest: ChangeRequestType = {
        id: 1,
        title: '',
        project: 'default',
        environment: 'default',
        minApprovals: 1,
        createdBy: { id: 1, username: 'user1', imageUrl: '' },
        createdAt: new Date(),
        features: [multiChangeFeature],
        segments: [],
        approvals: [],
        rejections: [],
        comments: [],
        state: 'Draft',
    };

    it('renders only one change container when multiple consolidated milestone changes are present', () => {
        const { getByTestId } = render(
            <div data-testid='feature-changes'>
                <FeatureChange
                    actions={null}
                    changeRequest={changeRequest}
                    change={change1}
                    feature={multiChangeFeature}
                />
                <FeatureChange
                    actions={null}
                    changeRequest={changeRequest}
                    change={change2}
                    feature={multiChangeFeature}
                />
                <FeatureChange
                    actions={null}
                    changeRequest={changeRequest}
                    change={change3}
                    feature={multiChangeFeature}
                />
            </div>,
        );

        // Only the first consolidated milestone change should render a container;
        // subsequent ones return null and do not appear in the document.
        expect(getByTestId('feature-changes').children).toHaveLength(1);
    });
});
