import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import React from 'react';
import InviteLinkButton from './InviteLinkButton';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';


test('Do not show button to non admins', async () => {
    render(<AccessProviderMock
        permissions={[]}
    >
        <InviteLinkButton />
    </AccessProviderMock>);

    expect(screen.queryByLabelText('Invite users')).not.toBeInTheDocument();
});

test('Show button to non admins', async () => {
    render(<AccessProviderMock
        permissions={[{
            permission: ADMIN
        }]}
    >
        <InviteLinkButton />
    </AccessProviderMock>);

    expect(screen.getByLabelText('Invite users')).toBeInTheDocument();
});

