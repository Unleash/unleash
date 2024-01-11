import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { NameWithChangeInfo } from './NameWithChangeInfo';

test.each(['', undefined])(
    'Should render only the new name if the previous name was %s',
    async (previousName) => {
        const newName = 'new name';
        render(
            <NameWithChangeInfo
                newName={newName}
                previousName={previousName}
            />,
        );

        // expect no del elements
        expect(
            screen.queryByText(previousName || '', { selector: 'del' }),
        ).toBeNull();

        // expect ins element with new strategy name
        await screen.findByText(newName, { selector: 'p' });
    },
);

test.each(['', undefined])(
    'Should render the old name as deleted and no new name if there was a previous name and the new one is %s',
    async (newName) => {
        const previousName = 'previous name';
        render(
            <NameWithChangeInfo
                newName={newName}
                previousName={previousName}
            />,
        );

        // expect no ins elements
        expect(screen.queryByText(newName || '', { selector: 'p' })).toBeNull();

        // expect del element with old strategy name
        await screen.findByText(previousName, { selector: 'del' });
    },
);

test('Should render the old name as deleted and the new name as inserted if the previous name was different', async () => {
    const newName = 'new name';
    const previousName = 'previous name';
    render(
        <NameWithChangeInfo newName={newName} previousName={previousName} />,
    );

    // expect del element with old strategy name
    await screen.findByText(previousName, { selector: 'del' });

    // expect ins element with new strategy name
    await screen.findByText(newName, { selector: 'p' });
});

test('Should render nothing if there was no name and there is still no name', async () => {
    render(<NameWithChangeInfo newName={undefined} previousName={undefined} />);

    expect(screen.queryByText('', { selector: 'p' })).toBeNull();
    expect(screen.queryByText('', { selector: 'del' })).toBeNull();
    expect(screen.queryByText('', { selector: 'span' })).toBeNull();
});
