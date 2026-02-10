import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ApiUrls } from './ApiUrls.tsx';

describe('ApiUrls', () => {
    const server = testServerSetup();

    test('renders default API URLs state', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            flags: {},
            unleashUrl: 'http://localhost:4242',
        });

        render(<ApiUrls />);

        expect(await screen.findByText('Backend')).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/'),
        ).toBeInTheDocument();
        expect(await screen.findByText('Frontend')).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/frontend/'),
        ).toBeInTheDocument();

        expect(screen.queryByText('Edge')).not.toBeInTheDocument();
    });

    test('renders with default state', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            unleashUrl: 'http://localhost:4242',
            edgeUrl: 'https://yourcompany.edge.getunleash.io',
        });

        render(<ApiUrls />);

        expect(await screen.findByText('Edge Backend')).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/',
            ),
        ).toBeInTheDocument();

        expect(await screen.findByText('Edge Frontend')).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/frontend/',
            ),
        ).toBeInTheDocument();

        expect(await screen.findByText('Backend')).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/'),
        ).toBeInTheDocument();
        expect(await screen.findByText('Frontend')).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/frontend/',
            ),
        ).toBeInTheDocument();
    });
});
