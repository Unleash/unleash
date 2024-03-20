import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ProjectMembers } from './ProjectMembers';

test('Show outdated project members', async () => {
    const members = {
        active: 10,
        totalPreviousMonth: 2,
        inactive: 5,
    };

    render(<ProjectMembers projectId={'default'} members={members} />);

    await screen.findByText('15');
    await screen.findByText('+13');
    await screen.findByText('10');
    await screen.findByText('5');
});
