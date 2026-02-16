import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ApiTokenDocs } from './ApiTokenDocs.tsx';

describe('ApiTokenDocs', () => {
    test('renders default alert', async () => {
        render(<ApiTokenDocs />);

        const link = await screen.findByRole('link', { name: 'SDK overview' });
        expect(link).toHaveAttribute('href', 'https://docs.getunleash.io/sdks');
    });
});
