import React from 'react';
import { screen } from '@testing-library/react';
import { EnvironmentChangeRequestTitle } from './EnvironmentChangeRequestTitle';
import { ChangeRequestState } from '../../changeRequest.types';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from '../../../../utils/testServer';
import { render } from '../../../../utils/testRenderer';
import { UIProviderContainer } from '../../../providers/UIProvider/UIProviderContainer';

const changeRequest = {
    id: 3,
    state: 'Draft' as ChangeRequestState,
    title: 'My title',
    project: 'default',
    environment: 'default',
    minApprovals: 5,
    createdBy: { id: 3, username: 'user', imageUrl: 'img' },
    createdAt: new Date(),
    features: [],
    approvals: [],
    comments: [],
};

const server = testServerSetup();

testServerRoute(
    server,
    `/api/admin/projects/${changeRequest.project}/change-requests/${changeRequest.id}/title`,
    {},
    'put'
);

testServerRoute(server, '/api/admin/ui-config', {});

test('can edit and save title', async () => {
    const user = userEvent.setup();

    render(
        <UIProviderContainer>
            <EnvironmentChangeRequestTitle
                environmentChangeRequest={changeRequest}
            />
        </UIProviderContainer>
    );

    const editButton = await screen.findByTestId('EditIcon');
    await user.click(editButton);

    const titleInput = await screen.findByDisplayValue(changeRequest.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');

    const saveButton = await screen.findByText('Save');
    await user.click(saveButton);

    const newTitle = await screen.findByDisplayValue('New title');
    expect(newTitle).toBeInTheDocument();
});
