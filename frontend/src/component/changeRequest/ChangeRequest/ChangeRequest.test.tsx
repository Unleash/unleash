import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ChangeRequest } from './ChangeRequest';
import { IChangeRequest } from '../changeRequest.types';

test('Display default strategy', async () => {
    const changeRequest: IChangeRequest = {
        approvals: [],
        comments: [],
        createdAt: new Date(),
        createdBy: {
            id: 1,
            username: 'author',
            imageUrl: '',
        },
        features: [
            {
                name: 'Feature Toggle Name',
                changes: [
                    {
                        id: 67,
                        action: 'updateEnabled',
                        payload: {
                            enabled: true,
                        },
                        createdAt: new Date(),
                        createdBy: {
                            id: 1,
                            username: 'admin',
                            imageUrl:
                                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
                        },
                    },
                ],
                defaultChange: {
                    id: 0,
                    action: 'addStrategy',
                    payload: {
                        name: 'flexibleRollout',
                        constraints: [],
                        parameters: {
                            rollout: '100',
                            stickiness: 'default',
                            groupId: 'test123',
                        },
                    },
                },
            },
        ],
        id: 0,
        minApprovals: 1,
        state: 'Draft',
        title: 'My change request',
        project: 'project',
        environment: 'production',
    };

    render(<ChangeRequest changeRequest={changeRequest} />);

    expect(screen.getByText('Feature Toggle Name')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(
        screen.getByText('Default strategy will be added')
    ).toBeInTheDocument();
});
