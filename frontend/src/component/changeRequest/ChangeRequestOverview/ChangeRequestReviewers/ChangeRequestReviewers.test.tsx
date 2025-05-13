import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { ChangeRequestReviewers } from './ChangeRequestReviewers.tsx';

test('Show approvers', async () => {
    render(
        <ChangeRequestReviewers
            changeRequest={{
                state: 'Approved',
                minApprovals: 2,
                rejections: [],
                approvals: [
                    {
                        createdBy: {
                            id: 1,
                            username: 'approver',
                            imageUrl: 'approverImg',
                        },
                        createdAt: new Date(),
                    },
                ],
            }}
        />,
    );

    expect(screen.getByText('Approved by')).toBeInTheDocument();
    expect(screen.getByText('approver')).toBeInTheDocument();
});

test('Show rejectors', async () => {
    render(
        <ChangeRequestReviewers
            changeRequest={{
                state: 'Rejected',
                minApprovals: 2,
                rejections: [
                    {
                        createdBy: {
                            id: 2,
                            username: 'rejector',
                            imageUrl: 'rejectorImg',
                        },
                        createdAt: new Date(),
                    },
                ],
                approvals: [
                    {
                        createdBy: {
                            id: 1,
                            username: 'approver',
                            imageUrl: 'approverImg',
                        },
                        createdAt: new Date(),
                    },
                ],
            }}
        />,
    );

    expect(screen.getByText('Rejected by')).toBeInTheDocument();
    expect(screen.getByText('rejector')).toBeInTheDocument();
    expect(screen.queryByText('Approved by')).not.toBeInTheDocument();
    expect(screen.queryByText('approver')).not.toBeInTheDocument();
});
