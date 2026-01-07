import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import InviteLinkButton from './InviteLinkButton.tsx';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {});
};
test('Do not show button to non admins', async () => {
    setupApi();
    render(
        <AccessProviderMock permissions={[]}>
            <InviteLinkButton />
        </AccessProviderMock>,
    );

    expect(screen.queryByLabelText('Invite users')).not.toBeInTheDocument();
});

test('Show button to non admins', async () => {
    setupApi();
    render(<InviteLinkButton />, { permissions: [{ permission: ADMIN }] });

    await screen.findByLabelText('Invite users');
});
