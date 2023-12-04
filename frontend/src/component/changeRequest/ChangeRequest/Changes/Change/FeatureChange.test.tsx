import React from 'react';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { FeatureChange } from './FeatureChange';
import { ChangeRequestState } from 'component/changeRequest/changeRequest.types';

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

    const feature = {
        name: 'conflict-test',
        changes: [change],
    };

    const changeRequest = (state: ChangeRequestState) => ({
        id: 1,
        state,
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
    });

    it.each(['Draft', 'Scheduled', 'In review', 'Approved'])(
        'should show schedule conflicts (when they exist) for change request in the %s state',
        async (changeRequestState) => {
            render(
                <FeatureChange
                    actions={<></>}
                    index={0}
                    changeRequest={changeRequest(
                        changeRequestState as ChangeRequestState,
                    )}
                    change={change}
                    feature={feature}
                />,
            );

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
        },
    );
});
