import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import { useContext, useEffect } from 'react';
import { screen } from '@testing-library/react';
import { ANNOUNCER_ELEMENT_TEST_ID } from 'utils/testIds';

const Announcing = ({ messages }: { messages: string[] }) => {
    const { announce } = useContext(AnnouncerContext);

    useEffect(() => {
        for (const message of messages) {
            announce(message);
        }
    }, [announce, messages]);

    return null;
};

test('announces each message', () => {
    render(<Announcing messages={['Foo', 'Bar']} />);

    const announcer = screen.getByTestId(ANNOUNCER_ELEMENT_TEST_ID);
    expect(announcer).toHaveTextContent('Foo');
    expect(announcer).toHaveTextContent('Bar');
});

test('announces a repeated message once per call', () => {
    render(<Announcing messages={['Saved', 'Saved']} />);

    // two separate entries, so a screen reader reads it out twice
    expect(screen.getAllByText('Saved')).toHaveLength(2);
});
