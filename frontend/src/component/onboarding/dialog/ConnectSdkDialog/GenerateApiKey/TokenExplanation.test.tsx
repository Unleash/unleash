import { describe, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { TokenExplanation } from './TokenExplanation';

const props = {
    project: 'my-project',
    environment: 'production',
    secret: 'abc123secret',
};

describe('TokenExplanation', () => {
    test('renders all token parts', () => {
        render(<TokenExplanation {...props} />);

        expect(screen.getAllByText('my-project').length).toBeGreaterThan(0);
        expect(screen.getAllByText('production').length).toBeGreaterThan(0);
        expect(screen.getAllByText('abc123secret').length).toBeGreaterThan(0);

        expect(
            screen.getByText(
                'The project this API key can retrieve feature flags from',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'The environment this API key can retrieve feature flag configuration from',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('The API key secret')).toBeInTheDocument();
    });
});
