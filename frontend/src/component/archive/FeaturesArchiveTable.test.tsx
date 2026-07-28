import { expect, test } from 'vitest';
import { waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerSetup } from 'utils/testServer';
import { FeaturesArchiveTable } from './FeaturesArchiveTable';

testServerSetup();

test('redirects to the lifecycle-archived overview', async () => {
    render(<FeaturesArchiveTable />, { route: '/archive' });

    await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('lifecycle')).toBe('IS:archived');
});

test('maps the archive search term to the overview query param', async () => {
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
