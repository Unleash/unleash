import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { StrategiesList } from './StrategiesList';
import renderer from 'react-test-renderer';
import theme from 'themes/mainTheme';
import AccessProvider from 'component/providers/AccessProvider/AccessProvider';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <AnnouncerProvider>
                    <UIProvider>
                        <AccessProvider permissions={[{ permission: ADMIN }]}>
                            <StrategiesList
                                strategies={[strategy]}
                                fetchStrategies={jest.fn()}
                                removeStrategy={jest.fn()}
                                deprecateStrategy={jest.fn()}
                                reactivateStrategy={jest.fn()}
                            />
                        </AccessProvider>
                    </UIProvider>
                </AnnouncerProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with one strategy without permissions', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <AnnouncerProvider>
                    <UIProvider>
                        <AccessProvider permissions={[{ permission: ADMIN }]}>
                            <StrategiesList
                                strategies={[strategy]}
                                fetchStrategies={jest.fn()}
                                removeStrategy={jest.fn()}
                                deprecateStrategy={jest.fn()}
                                reactivateStrategy={jest.fn()}
                            />
                        </AccessProvider>
                    </UIProvider>
                </AnnouncerProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
