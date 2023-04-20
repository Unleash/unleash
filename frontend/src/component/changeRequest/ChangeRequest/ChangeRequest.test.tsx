import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ChangeRequest } from './ChangeRequest';
import {
    IChangeRequest,
    IChangeRequestAddStrategy,
    IChangeRequestEnabled,
} from '../changeRequest.types';

const changeRequestWithDefaultChange = (
    defaultChange: IChangeRequestEnabled | IChangeRequestAddStrategy
) => {
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
                defaultChange,
            },
        ],
        id: 0,
        minApprovals: 1,
        state: 'Draft',
        title: 'My change request',
        project: 'project',
        environment: 'production',
    };
    return changeRequest;
};

test('Display default add strategy', async () => {
    render(
        <ChangeRequest
            changeRequest={changeRequestWithDefaultChange({
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
            })}
        />
    );

    expect(screen.getByText('Feature Toggle Name')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(
        screen.getByText('Default strategy will be added')
    ).toBeInTheDocument();
});

test('Display default disable feature', async () => {
    render(
        <ChangeRequest
            changeRequest={changeRequestWithDefaultChange({
                id: 0,
                action: 'updateEnabled',
                payload: {
                    enabled: false,
                },
            })}
        />
    );

    expect(screen.getByText('Feature Toggle Name')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Feature status will change')).toBeInTheDocument();
});
