import { expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from '@server/types/permissions';
import { CreateTokenPanel } from './CreateTokenPanel.tsx';

const server = testServerSetup();

const setup = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: 10 },
    });
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/environments', {
        environments: [
            { name: 'production', enabled: true, sortOrder: 1 },
            { name: 'development', enabled: true, sortOrder: 2 },
            { name: 'old', enabled: false, sortOrder: 3 },
        ],
    });
    return testServerRoute(
        server,
        '/api/admin/api-tokens',
        { secret: '*:development.created-secret' },
        'post',
        201,
    );
};

const open = async (onClose = () => {}) => {
    render(<CreateTokenPanel appName='checkout' onClose={onClose} />, {
        permissions: [{ permission: ADMIN }],
    });
    return screen.findByLabelText('Token name');
};

test('suggests a name, links the token and shows its secret until Done', async () => {
    const { requests } = setup();
    const onClose = vi.fn();
    const name = await open(onClose);

    await waitFor(() => expect(name).toHaveValue('checkout-production'));
    expect(screen.queryByRole('radio', { name: 'old' })).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'development' }));
    expect(name).toHaveValue('checkout-development');

    await userEvent.click(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('Token created');
    screen.getByText('*:development.created-secret');
    screen.getByText(/Copy it now/);
    screen.getByText(/appName: 'checkout'/);
    screen.getByText(/attributed to checkout, whatever appName the SDK sends/);
    expect(requests).toEqual([
        {
            appName: 'checkout',
            tokenName: 'checkout-development',
            environment: 'development',
            type: 'CLIENT',
            projects: ['*'],
        },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClose).toHaveBeenCalledOnce();
});

test('asks for a project instead of defaulting to all projects', async () => {
    const { requests } = setup();
    await open();

    expect(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    ).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('At least one project is required');
    expect(requests).toEqual([]);
});

test("preselects the projects the application's other tokens name", async () => {
    const { requests } = setup();
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { id: 'dx', name: 'DX' },
            { id: 'eg', name: 'EG' },
            { id: 'sa', name: 'SA' },
        ],
    });
    const linked = (tokenName: string, projects: string[], extra = {}) => ({
        tokenName,
        type: 'backend',
        environment: 'production',
        projects,
        createdAt: '2026-11-17T10:00:00.000Z',
        ...extra,
    });
    testServerRoute(server, '/api/admin/api-tokens', {
        tokens: [
            linked('one', ['dx']),
            linked('two', ['eg', 'dx']),
            linked('old', ['sa'], { expiresAt: '2020-01-01T00:00:00.000Z' }),
        ],
    });
    await open();

    await screen.findByText(
        "Pre-selected from this application's other tokens.",
    );
    screen.getByRole('button', { name: 'DX' });
    screen.getByRole('button', { name: 'EG' });
    expect(screen.queryByRole('button', { name: 'SA' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('Token created');
    expect(requests).toMatchObject([{ projects: ['dx', 'eg'] }]);
});

test('brings the picked projects back when all projects is unticked', async () => {
    setup();
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'dx', name: 'DX' }],
    });
    testServerRoute(server, '/api/admin/api-tokens', {
        tokens: [
            {
                tokenName: 'one',
                type: 'backend',
                environment: 'production',
                projects: ['dx'],
                createdAt: '2026-11-17T10:00:00.000Z',
            },
        ],
    });
    await open();
    const all = screen.getByRole('checkbox', {
        name: /All current and future projects/,
    });

    await screen.findByRole('button', { name: 'DX' });
    await userEvent.click(all);
    expect(screen.queryByRole('button', { name: 'DX' })).toBeNull();
    expect(screen.getByRole('combobox')).toBeDisabled();
    await userEvent.click(all);

    screen.getByRole('button', { name: 'DX' });
});

test('keeps the chosen projects when the token type changes', async () => {
    const { requests } = setup();
    await open();

    await userEvent.click(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    );
    await userEvent.click(screen.getByRole('radio', { name: /Frontend SDK/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('Token created');
    expect(requests).toMatchObject([{ type: 'FRONTEND', projects: ['*'] }]);
});

test('keeps a name the user typed when the environment changes', async () => {
    setup();
    const name = await open();

    await waitFor(() => expect(name).toHaveValue('checkout-production'));
    await userEvent.clear(name);
    await userEvent.type(name, 'checkout-api');
    await userEvent.click(screen.getByRole('radio', { name: 'development' }));

    expect(name).toHaveValue('checkout-api');
});

test('keeps the chosen environment when the token type changes', async () => {
    setup();
    const name = await open();

    await waitFor(() => expect(name).toHaveValue('checkout-production'));
    await userEvent.click(screen.getByRole('radio', { name: 'development' }));
    await userEvent.click(screen.getByRole('radio', { name: /Frontend SDK/ }));

    expect(screen.getByRole('radio', { name: 'development' })).toBeChecked();
    expect(name).toHaveValue('checkout-development');
});

test('stays open while the token is being created, so its secret is not lost', async () => {
    setup();
    server.use(
        http.post('/api/admin/api-tokens', async () => {
            await delay(200);
            return HttpResponse.json(
                { secret: '*:production.slow' },
                { status: 201 },
            );
        }),
    );
    const onClose = vi.fn();
    await open(onClose);
    await userEvent.click(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));
    await userEvent.click(screen.getByTestId('CloseIcon'));

    await screen.findByText('*:production.slow');
    expect(onClose).not.toHaveBeenCalled();
});
