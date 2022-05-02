import { MemoryRouter } from 'react-router-dom';
import { StrategiesList } from './StrategiesList';
import renderer from 'react-test-renderer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';

test('renders correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider>
                <AnnouncerProvider>
                    <UIProvider>
                        <AccessProviderMock
                            permissions={[{ permission: ADMIN }]}
                        >
                            <StrategiesList />
                        </AccessProviderMock>
                    </UIProvider>
                </AnnouncerProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
