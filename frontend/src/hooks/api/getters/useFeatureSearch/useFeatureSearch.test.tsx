import { FC } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useFeatureSearch } from './useFeatureSearch';
import { useSWRConfig } from 'swr';

const server = testServerSetup();

const TestComponent: FC<{ params: { project: string } }> = ({ params }) => {
    const { loading, error, features, total } = useFeatureSearch(params);
    const { cache } = useSWRConfig();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
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

    test('should keep only latest cache entry', async () => {
        testServerRoute(server, '/api/admin/search/features?project=project1', {
            features: [{ name: 'Feature1' }],
            total: 1,
        });
        render(<TestComponent params={{ project: 'project1' }} />);
        await screen.findByText(/Features:/);
        await screen.findByText(
            'Cache: api/admin/search/features?project=project1',
        );

        testServerRoute(server, '/api/admin/search/features?project=project2', {
            features: [{ name: 'Feature2' }],
            total: 1,
        });
        render(<TestComponent params={{ project: 'project2' }} />);
        await screen.findByText(/Features:/);
        await screen.findByText(
            'Cache: api/admin/search/features?project=project2',
        );
    });
});
