import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import InviteLinkButton from './InviteLinkButton.tsx';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = (newUserInviteFlow = false) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { newUserInviteFlow },
    });
};
test('does not show the invite control to non-admins', async () => {
    setupApi(true);
    render(
        <AccessProviderMock permissions={[]}>
            <InviteLinkButton />
        </AccessProviderMock>,
    );

    expect(screen.queryByLabelText('Invite users')).not.toBeInTheDocument();
});

test('shows the existing invite button when the new flow is disabled', async () => {
    setupApi();
    render(<InviteLinkButton />, { permissions: [{ permission: ADMIN }] });

    await screen.findByLabelText('Invite users');
});

test('links directly to the users page when the new flow is enabled', async () => {
    setupApi(true);
    render(<InviteLinkButton />, { permissions: [{ permission: ADMIN }] });

    const inviteLink = await screen.findByRole('link', {
        name: 'Invite users',
    });

    expect(inviteLink).toHaveAttribute('href', '/admin/users');
    expect(inviteLink).toHaveTextContent('Invite');
});
