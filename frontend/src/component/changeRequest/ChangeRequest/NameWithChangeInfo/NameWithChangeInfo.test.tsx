import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import React from 'react';
import { NameWithChangeInfo } from './NameWithChangeInfo';

test.each(['', undefined])(
    'Should render only the new title if the previous title was %s',
    async previousTitle => {
        const newTitle = 'new title';
        render(
            <NameWithChangeInfo
                newTitle={newTitle}
                previousTitle={previousTitle}
            />
        );

        // expect no del elements
        expect(
            screen.queryByText(previousTitle || '', { selector: 'del' })
        ).toBeNull();

        // expect ins element with new strategy name
        await screen.findByText(newTitle, { selector: 'ins' });
    }
);

test.each(['', undefined])(
    'Should render the old title as deleted and no new title if there was a previous title and the new one is %s',
    async newTitle => {
        const previousTitle = 'previous title';
        render(
            <NameWithChangeInfo
                newTitle={newTitle}
                previousTitle={previousTitle}
            />
        );

        // expect no ins elements
        expect(
            screen.queryByText(newTitle || '', { selector: 'ins' })
        ).toBeNull();

        // expect del element with old strategy name
        await screen.findByText(previousTitle, { selector: 'del' });
    }
);

test('Should render the old title as deleted and the new title as inserted if the previous title was different', async () => {
    const newTitle = 'new title';
    const previousTitle = 'previous title';
    render(
        <NameWithChangeInfo newTitle={newTitle} previousTitle={previousTitle} />
    );

    // expect del element with old strategy name
    await screen.findByText(previousTitle, { selector: 'del' });

    // expect ins element with new strategy name
    await screen.findByText(newTitle, { selector: 'ins' });
});

test('Should render the title in a span if it has not changed', async () => {
    const title = 'title';
    render(<NameWithChangeInfo newTitle={title} previousTitle={title} />);

    // expect no del or ins elements
    expect(screen.queryByText(title, { selector: 'ins' })).toBeNull();
    expect(screen.queryByText(title, { selector: 'del' })).toBeNull();

    // expect span element with the strategy name
    await screen.findByText(title, { selector: 'span' });
});

test('Should render nothing if there was no title and there is still no title', async () => {
    render(
        <NameWithChangeInfo newTitle={undefined} previousTitle={undefined} />
    );

    expect(screen.queryByText('', { selector: 'ins' })).toBeNull();
    expect(screen.queryByText('', { selector: 'del' })).toBeNull();
    expect(screen.queryByText('', { selector: 'span' })).toBeNull();
});
