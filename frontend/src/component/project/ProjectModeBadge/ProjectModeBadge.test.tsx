import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { ProjectModeBadge } from './ProjectModeBadge.tsx';

test.each([
    {
        mode: 'private',
        label: 'Private project',
        description:
            'Only admins, editors and project members can see and access the project and associated feature flags',
    },
    {
        mode: 'protected',
        label: 'Protected project',
        description:
            'Only admins and project members can submit change requests',
    },
])('labels a $mode project and explains its mode on hover', async ({
    mode,
    label,
    description,
}) => {
    render(<ProjectModeBadge mode={mode} />);

    await userEvent.hover(screen.getByRole('img', { name: label }));
    await screen.findByRole('tooltip');

    expect(
        screen.getByRole('img', { name: label }),
    ).toHaveAccessibleDescription(`${label}: ${description}`);
});

test('shows nothing for an open project', () => {
    render(<ProjectModeBadge mode='open' />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
