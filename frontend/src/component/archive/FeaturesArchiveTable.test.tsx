import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeaturesArchiveTable } from './FeaturesArchiveTable';

const server = testServerSetup();

const setupApi = (archiveInFlagsView: boolean) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { archiveInFlagsView },
    });
};

test('redirects to the lifecycle-archived overview when archiveInFlagsView is on', async () => {
    setupApi(true);

    render(<FeaturesArchiveTable />, { route: '/archive' });

    await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('lifecycle')).toBe('IS:archived');
});

test('maps the archive search term to the overview query param', async () => {
    setupApi(true);

    render(<FeaturesArchiveTable />, { route: '/archive?search=myflag' });

    await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('lifecycle')).toBe('IS:archived');
    expect(params.get('query')).toBe('myflag');
    expect(params.get('search')).toBeNull();
});

test('preserves other query params on redirect', async () => {
    setupApi(true);

    render(<FeaturesArchiveTable />, {
        route: '/archive?sortBy=createdAt&sortOrder=desc',
    });

    await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('lifecycle')).toBe('IS:archived');
    expect(params.get('sortBy')).toBe('createdAt');
    expect(params.get('sortOrder')).toBe('desc');
});

test('renders the archive table without redirecting when the flag is off', async () => {
    setupApi(false);

    render(<FeaturesArchiveTable />, { route: '/archive' });

    await screen.findByText('None of the feature flags were archived yet.');
    expect(window.location.pathname).toBe('/archive');
});
