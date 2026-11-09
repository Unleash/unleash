import { expect, test } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { InstanceName } from './InstanceName.tsx';

const server = testServerSetup();

test('edits and saves the trimmed instance name', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { UNLEASH_CLOUD: true },
    });
    testServerRoute(server, '/api/instance/status', { name: 'Old Name' });
    const { requests } = testServerRoute(
        server,
        '/api/instance/name',
        {},
        'post',
    );

    render(<InstanceName />, { permissions: [{ permission: ADMIN }] });

    const input = await screen.findByDisplayValue('Old Name');
    const save = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(input, { target: { value: 'Acme <script>' } });
    expect(save).toBeDisabled();

    fireEvent.change(input, { target: { value: '  Acme Rebrand  ' } });
    fireEvent.click(save);

    await waitFor(() => expect(requests).toEqual([{ name: 'Acme Rebrand' }]));
});
