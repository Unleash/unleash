import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import InviteLinkButton from './InviteLinkButton.tsx';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { testServerSetup } from 'utils/testServer';

testServerSetup();

test('does not show the invite control to non-admins', () => {
    render(
        <AccessProviderMock permissions={[]}>
            <InviteLinkButton />
        </AccessProviderMock>,
    );

    expect(screen.queryByLabelText('Invite users')).not.toBeInTheDocument();
});

test('links directly to the users page for admins', async () => {
    render(<InviteLinkButton />, { permissions: [{ permission: ADMIN }] });

    const inviteLink = await screen.findByRole('link', {
        name: 'Invite users',
    });

    expect(inviteLink).toHaveAttribute('href', '/admin/users');
    expect(inviteLink).toHaveTextContent('Invite');
});
