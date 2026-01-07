import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { LastSeenProgress } from './LastSeenProgress.tsx';

test('Show last seen progress bar', async () => {
    render(<LastSeenProgress yes={5} no={5} />);

    await screen.findByText('50%');
});
