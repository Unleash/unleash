import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ApiTokenDocs } from './ApiTokenDocs.tsx';

describe('ApiTokenDocs', () => {
    const server = testServerSetup();

    test('renders default API URLs state', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            flags: {},
            unleashUrl: 'http://localhost:4242',
        });

        render(<ApiTokenDocs />);

        expect(await screen.findByText('CLIENT API URL:')).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/'),
        ).toBeInTheDocument();
        expect(
            await screen.findByText('FRONTEND API URL:'),
        ).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/frontend/'),
        ).toBeInTheDocument();

        expect(screen.queryByText('EDGE API URL:')).not.toBeInTheDocument();
        expect(screen.queryByText('EDGE FRONTEND API URL:')).not.toBeInTheDocument();
    });

    test('renders with default state', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            unleashUrl: 'http://localhost:4242',
            edgeUrl: 'https://yourcompany.edge.getunleash.io',
        });

        render(<ApiTokenDocs />);

        expect(await screen.findByText('EDGE API URL:')).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/',
            ),
        ).toBeInTheDocument();

        expect(await screen.findByText('EDGE FRONTEND API URL:')).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/frontend/',
            ),
        ).toBeInTheDocument();

        expect(await screen.findByText('CLIENT API URL:')).toBeInTheDocument();
        expect(
            await screen.findByText('http://localhost:4242/api/'),
        ).toBeInTheDocument();
        expect(
            await screen.findByText('FRONTEND API URL:'),
        ).toBeInTheDocument();
        expect(
            await screen.findByText(
                'https://yourcompany.edge.getunleash.io/api/frontend/',
            ),
        ).toBeInTheDocument();
    });
});
