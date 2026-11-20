import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateApplicationDialog } from './CreateApplicationDialog.tsx';

const server = testServerSetup();

test('creates an application and opens its page', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    const { requests } = testServerRoute(
        server,
        '/api/admin/applications',
        { appName: 'checkout' },
        'post',
        201,
    );
    render(<CreateApplicationDialog onClose={() => {}} />);

    await userEvent.type(await screen.findByLabelText('Name'), 'checkout');
    await userEvent.click(
        screen.getByText('Create application', { selector: 'button' }),
    );

    await waitFor(() =>
        expect(window.location.pathname).toBe('/applications/checkout'),
    );
    expect(requests).toEqual([{ appName: 'checkout' }]);
});

test('shows why the server refused the name', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(
        server,
        '/api/admin/applications',
        { message: 'An application named "checkout" already exists' },
        'post',
        409,
    );
    render(<CreateApplicationDialog onClose={() => {}} />);

    await userEvent.type(await screen.findByLabelText('Name'), 'Checkout');
    await userEvent.click(
        screen.getByText('Create application', { selector: 'button' }),
    );

    await screen.findByText('An application named "checkout" already exists');
});

test('explains an invalid name and blocks submit', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    render(<CreateApplicationDialog onClose={() => {}} />);

    await userEvent.type(
        await screen.findByLabelText('Name'),
        'checkout service',
    );

    await screen.findByText(/starting with a letter or number/);
    expect(
        screen.getByText('Create application', { selector: 'button' }),
    ).toBeDisabled();
});
