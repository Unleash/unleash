import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ApplicationUsageCell } from './ApplicationUsageCell.tsx';

test('displays not connected if no usage found', () => {
    render(<ApplicationUsageCell usage={[]} />);

    expect(screen.getByText('not connected')).toBeInTheDocument();
});

test('display project and environments in correct manner', () => {
    render(
        <ApplicationUsageCell
            usage={[
                { project: 'myProject', environments: ['dev', 'production'] },
            ]}
        />,
    );

    const anchor = screen.getByRole('link');
    expect(anchor).toHaveAttribute('href', '/projects/myProject');
    expect(screen.getByText('(dev, production)')).toBeInTheDocument();
});

test('when no specific project is defined, do not create link', () => {
    render(
        <ApplicationUsageCell
            usage={[{ project: '*', environments: ['dev', 'production'] }]}
        />,
    );

    const anchor = screen.queryByRole('link');
    expect(anchor).not.toBeInTheDocument();
});
