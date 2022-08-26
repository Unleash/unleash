import { render } from 'utils/testRenderer';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import { useContext, useEffect } from 'react';
import { screen } from '@testing-library/react';
import { ANNOUNCER_ELEMENT_TEST_ID } from 'utils/testIds';

test('AnnouncerContext', async () => {
    const TestComponent = () => {
        const { setAnnouncement } = useContext(AnnouncerContext);

        useEffect(() => {
            setAnnouncement('Foo');
            setAnnouncement('Bar');
        }, [setAnnouncement]);

        return null;
    };

    render(<TestComponent />);

    const el = screen.getByTestId(ANNOUNCER_ELEMENT_TEST_ID);
    expect(el).not.toHaveTextContent('Foo');
    expect(el).toHaveTextContent('Bar');
});
