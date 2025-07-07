import { type FC, useState } from 'react';
import { screen } from '@testing-library/react';
import { ChangeRequestTitle } from './ChangeRequestTitle.tsx';
import type { UnscheduledChangeRequest } from 'component/changeRequest/changeRequest.types';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';

const changeRequest: UnscheduledChangeRequest = {
    id: 3,
    state: 'Draft' as const,
    title: 'My title',
    project: 'default',
    environment: 'default',
    minApprovals: 5,
    createdBy: { id: 3, username: 'user', imageUrl: 'img' },
    createdAt: new Date(),
    features: [],
    approvals: [],
    rejections: [],
    comments: [],
    segments: [],
};

const server = testServerSetup();

testServerRoute(
    server,
    `/api/admin/projects/${changeRequest.project}/change-requests/${changeRequest.id}/title`,
    {},
    'put',
);

testServerRoute(server, '/api/admin/ui-config', {});

const TestComponent: FC = () => {
    const [title, setTitle] = useState(changeRequest.title);

    return (
        <ChangeRequestTitle
            environmentChangeRequest={changeRequest}
            title={title}
            setTitle={setTitle}
        >
            <h1>{title}</h1>
        </ChangeRequestTitle>
    );
};

test('can edit and save title', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const editButton = await screen.findByTestId('EditIcon');
    await user.click(editButton);

    const titleInput = await screen.findByDisplayValue(changeRequest.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');

    const saveButton = await screen.findByText('Save');
    await user.click(saveButton);

    const newTitle = await screen.findByText('New title');
    expect(newTitle).toBeInTheDocument();
});
