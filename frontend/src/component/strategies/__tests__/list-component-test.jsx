import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { StrategiesList } from '../StrategiesList/StrategiesList';
import renderer from 'react-test-renderer';
import theme from '../../../themes/main-theme';
import AccessProvider from '../../providers/AccessProvider/AccessProvider';
import { ADMIN } from '../../providers/AccessProvider/permissions';
import UIProvider from '../../providers/UIProvider/UIProvider';

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <UIProvider>
                    <AccessProvider permissions={[{ permission: ADMIN }]}>
                        <StrategiesList
                            strategies={[strategy]}
                            fetchStrategies={jest.fn()}
                            removeStrategy={jest.fn()}
                            deprecateStrategy={jest.fn()}
                            reactivateStrategy={jest.fn()}
                            history={{}}
                        />
                    </AccessProvider>
                </UIProvider>
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
                <UIProvider>
                    <AccessProvider permissions={[{ permission: ADMIN }]}>
                        <StrategiesList
                            strategies={[strategy]}
                            fetchStrategies={jest.fn()}
                            removeStrategy={jest.fn()}
                            deprecateStrategy={jest.fn()}
                            reactivateStrategy={jest.fn()}
                            history={{}}
                        />
                    </AccessProvider>
                </UIProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
