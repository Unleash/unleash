import { describe, expect, it } from 'vitest';
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
    const planSnapshot = {
        id: 'plan-1',
        name: 'Test plan',
        description: '',
        createdAt: '',
        createdByUserId: 1,
        featureName: 'milestone-test',
        environment: 'default',
        safeguards: [],
        milestones: [
            {
                id: 'milestone-1',
                name: 'Milestone 1',
                releasePlanDefinitionId: 'plan-1',
                strategies: [],
            },
            {
                id: 'milestone-2',
                name: 'Milestone 2',
                releasePlanDefinitionId: 'plan-1',
                strategies: [],
            },
            {
                id: 'milestone-3',
                name: 'Milestone 3',
                releasePlanDefinitionId: 'plan-1',
                strategies: [],
            },
        ],
    };

    const makeConsolidatedChange = (id: number): IFeatureChange => ({
        id,
        action: 'changeMilestoneProgression' as const,
        payload: {
            sourceMilestone: `milestone-${id}`,
            targetMilestone: `milestone-${id + 1}`,
            transitionCondition: { intervalMinutes: 30 },
            snapshot: planSnapshot,
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
        state: 'Applied',
    };

    it('renders the first consolidated change with all changes listed', () => {
        render(
            <FeatureChange
                actions={null}
                changeRequest={changeRequest}
                change={change1}
                feature={multiChangeFeature}
            />,
        );

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent(
            'Editing automation for Milestone 1',
        );
        expect(items[1]).toHaveTextContent(
            'Editing automation for Milestone 2',
        );
        expect(items[2]).toHaveTextContent(
            'Editing automation for Milestone 3',
        );
    });

    it('renders nothing for consolidated changes after the first', () => {
        render(
            <FeatureChange
                actions={null}
                changeRequest={changeRequest}
                change={change2}
                feature={multiChangeFeature}
            />,
        );

        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
});
