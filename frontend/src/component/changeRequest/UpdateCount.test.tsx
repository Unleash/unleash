import { render } from 'utils/testRenderer';
import { UpdateCount } from './UpdateCount.tsx';
import { screen } from '@testing-library/react';

test('Show only features count when no segments', async () => {
    render(<UpdateCount featuresCount={1} segmentsCount={0} />);

    expect(screen.getByText('1 feature flag')).toBeInTheDocument();
    expect(screen.queryByText('0 segments')).not.toBeInTheDocument();
});

test('Show features and segments count', async () => {
    render(<UpdateCount featuresCount={0} segmentsCount={1} />);

    expect(screen.getByText('0 feature flags')).toBeInTheDocument();
    expect(screen.getByText('1 segment')).toBeInTheDocument();
});

test('Show features and segments plural count', async () => {
    render(<UpdateCount featuresCount={2} segmentsCount={3} />);

    expect(screen.getByText('2 feature flags')).toBeInTheDocument();
    expect(screen.getByText('3 segments')).toBeInTheDocument();
});
