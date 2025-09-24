import type { FC } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    getFeatureSearchFetcher,
    useFeatureSearch,
} from './useFeatureSearch.ts';
import { useSWRConfig } from 'swr';

const server = testServerSetup();

const TestComponent: FC<{ params: { project: string } }> = ({ params }) => {
    const { loading, error, features, total, refetch } =
        useFeatureSearch(params);
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
            <div>Features: {features.map((f) => f.name).join(', ')}</div>
            <div>Total: {total}</div>
            <div>Cache: {[...cache.keys()]}</div>
        </div>
    );
};

describe('useFeatureSearch', () => {
    test('should return features after loading', async () => {
        testServerRoute(server, '/api/admin/search/features?project=project1', {
            features: [{ name: 'Feature1' }, { name: 'Feature2' }],
            total: 2,
        });

        render(<TestComponent params={{ project: 'project1' }} />);

        await screen.findByText(/Loading.../);

        await screen.findByText(/Features:/);
        await screen.findByText(/Total:/);
    });

    test('should keep at least latest cache entry', async () => {
        testServerRoute(server, '/api/admin/search/features?project=project1', {
            features: [{ name: 'Feature1' }],
            total: 1,
        });

        render(<TestComponent params={{ project: 'project1' }} />);
        await screen.findByText(/Features: Feature1/);
        await screen.findByText(
            'Cache: api/admin/search/features?project=project1',
        );

        testServerRoute(server, '/api/admin/search/features?project=project2', {
            features: [{ name: 'Feature2' }],
            total: 1,
        });
        render(<TestComponent params={{ project: 'project2' }} />);
        await screen.findByText(/Features: Feature2/);
        await screen.findByText(
            'Cache: api/admin/search/features?project=project1api/admin/search/features?project=project2',
        );
    });

    test('should overwrite cache total with 0 if the next result has 0 values', async () => {
        const project = 'project3';
        const url = `/api/admin/search/features?project=${project}`;
        testServerRoute(server, url, {
            features: [{ name: 'Feature1' }],
            total: 1,
        });

        const { rerender } = render(<TestComponent params={{ project }} />);

        await screen.findByText(/Total: 1/);

        testServerRoute(server, url, {
            features: [],
            total: 0,
        });

        // force fetch
        const button = await screen.findByRole('button', { name: 'refetch' });
        button.click();

        rerender(<TestComponent params={{ project }} />);
        await screen.findByText(/Total: 0/);
    });

    test('should give the same cache key, regardless of parameter order', async () => {
        const params1 = {
            query: 'query-string',
            project: 'IS:project',
        };
        const params2 = {
            project: 'IS:project',
            query: 'query-string',
        };
        const { KEY: key1 } = getFeatureSearchFetcher(params1);
        const { KEY: key2 } = getFeatureSearchFetcher(params2);
        expect(key1).toEqual(key2);
    });
});
