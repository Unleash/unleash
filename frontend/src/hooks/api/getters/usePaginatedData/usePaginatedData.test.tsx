import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { createPaginatedHook } from './usePaginatedData.ts';
import type { FC } from 'react';
import { http, HttpResponse } from 'msw';

const server = testServerSetup();

const usePaginatedData = createPaginatedHook<{ total: number; items: string }>(
    { total: 0, items: 'default' },
    '/api/project/my-project?',
);

const TestComponent: FC<{ query: string }> = ({ query }) => {
    const { items, total } = usePaginatedData({ query });

    return (
        <span>
            {items} ({total})
        </span>
    );
};

test('Pass query params to server and return total', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    server.use(
        http.get('/api/project/my-project', ({ request }) => {
            const url = new URL(request.url);
            return HttpResponse.json({
                items: `result${url.searchParams.get('query')}`,
                total: 10,
            });
        }),
    );
    render(<TestComponent query='value' />);

    await screen.findByText('default (0)');
    const _element = await screen.findByText('resultvalue (10)');
});
