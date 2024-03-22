import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ProjectMembers } from './ProjectMembers';

test('Show outdated project members', async () => {
    const members = {
        currentMembers: 10,
        change: 2,
    };

    render(<ProjectMembers projectId={'default'} members={members} />);

    await screen.findByText('10');
    await screen.findByText('+2');
});
