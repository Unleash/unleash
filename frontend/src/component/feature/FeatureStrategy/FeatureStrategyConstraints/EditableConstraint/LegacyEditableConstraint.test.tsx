import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { expect, test, vi } from 'vitest';
import { EditableConstraint } from './LegacyEditableConstraint.tsx';

const server = testServerSetup();

test('a date constraint without a value defaults to the current time', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/context', [{ name: 'currentTime' }]);
    const onUpdate = vi.fn();
    const before = Date.now();

    render(
        <EditableConstraint
            constraint={{
                contextName: 'currentTime',
                operator: 'DATE_AFTER',
                value: '',
            }}
            onDelete={() => {}}
            onUpdate={onUpdate}
        />,
    );

    expect(await screen.findByLabelText('Date')).not.toHaveValue('');
    await waitFor(() => {
        const { value } = onUpdate.mock.lastCall?.[0] ?? {};
        expect(new Date(value).getTime()).toBeGreaterThanOrEqual(before);
    });
});
