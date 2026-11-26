import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SidebarCountBadge } from './SidebarCountBadge.tsx';

const renderBadge = (count: number) =>
    render(
        <SidebarCountBadge
            color='neutral'
            count={count}
            description='to review'
        />,
    );

test('shows nothing when there is nothing to count', () => {
    renderBadge(0);

    expect(screen.queryByText(/to review/)).not.toBeInTheDocument();
});

test('shows counts up to 99 as they are', () => {
    renderBadge(99);

    expect(screen.getByText('99')).toBeInTheDocument();
});

test('caps the count at 99+', () => {
    renderBadge(100);

    expect(screen.getByText('99+')).toBeInTheDocument();
});
