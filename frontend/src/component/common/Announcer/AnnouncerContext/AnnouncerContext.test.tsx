import { render } from 'utils/testRenderer';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import { useContext, useEffect } from 'react';
import { screen } from '@testing-library/react';

test('AnnouncerContext', async () => {
    const TestComponent = () => {
        const { setAnnouncement } = useContext(AnnouncerContext);

        useEffect(() => {
            setAnnouncement('Foo');
            setAnnouncement('Bar');
        }, [setAnnouncement]);

        return null;
    };

    render(
        <AnnouncerProvider>
            <TestComponent />
        </AnnouncerProvider>
    );

    expect(screen.getByRole('status')).not.toHaveTextContent('Foo');
    expect(screen.getByRole('status')).toHaveTextContent('Bar');
});
