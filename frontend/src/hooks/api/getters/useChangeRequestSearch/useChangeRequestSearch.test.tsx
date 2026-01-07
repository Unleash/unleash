import type { FC } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useChangeRequestSearch } from './useChangeRequestSearch.ts';
import { useSWRConfig } from 'swr';

const server = testServerSetup();

const TestComponent: FC<{ params: { createdBy?: string; limit?: number } }> = ({
    params,
}) => {
    const { loading, error, changeRequests, total, refetch } =
        useChangeRequestSearch(params);
    const { cache } = useSWRConfig();
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <button type='button' onClick={refetch}>
                refetch
            </button>
            <div>
                Change Requests:{' '}
                {changeRequests.map((cr) => cr.title).join(', ')}
            </div>
            <div>Total: {total}</div>
            <div>Cache: {[...cache.keys()]}</div>
        </div>
    );
};

describe('useChangeRequestSearch', () => {
    test('should overwrite cache total with 0 if the next result has 0 values', async () => {
        const createdBy = '789';
        const url = `/api/admin/search/change-requests?createdBy=${createdBy}`;
        testServerRoute(server, url, {
            changeRequests: [
                {
                    id: 1,
                    title: 'Change Request 1',
                    createdAt: '2024-01-01T00:00:00Z',
                    createdBy: { id: 789, username: 'testuser' },
                    environment: 'production',
                    project: 'test-project',
                    features: ['feature1'],
                    segments: [],
                    state: 'Draft',
                },
            ],
            total: 1,
        });

        const { rerender } = render(<TestComponent params={{ createdBy }} />);

        await screen.findByText(/Total: 1/);

        testServerRoute(server, url, {
            changeRequests: [],
            total: 0,
        });

        // force fetch
        const button = await screen.findByRole('button', { name: 'refetch' });
        button.click();

        rerender(<TestComponent params={{ createdBy }} />);
        await screen.findByText(/Total: 0/);
    });
});
