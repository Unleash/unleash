import type { FC } from 'react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useFirstProjectFeature } from './useFirstProjectFeature.ts';

const server = testServerSetup();

const TestComponent: FC<{ projectId: string }> = ({ projectId }) => {
    const { feature, goToFlagHref } = useFirstProjectFeature(projectId);
    return (
        <div>
            <span data-testid='feature'>{feature ?? 'none'}</span>
            <span data-testid='href'>{goToFlagHref ?? 'no-href'}</span>
        </div>
    );
};

test('picks the first feature and links to its flag page', async () => {
    testServerRoute(server, '/api/admin/search/features', {
        features: [{ name: 'first-flag' }, { name: 'second-flag' }],
        total: 2,
    });

    render(<TestComponent projectId='default' />);

    expect(await screen.findByTestId('feature')).toHaveTextContent(
        'first-flag',
    );
    expect(await screen.findByTestId('href')).toHaveTextContent(
        '/projects/default/features/first-flag',
    );
});

test('has no flag link when the project is empty', async () => {
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });

    render(<TestComponent projectId='default' />);

    expect(await screen.findByTestId('href')).toHaveTextContent('no-href');
    expect(screen.getByTestId('feature')).toHaveTextContent('none');
});
