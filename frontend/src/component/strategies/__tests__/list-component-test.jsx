import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import StrategiesListComponent from '../StrategiesList/StrategiesList';
import renderer from 'react-test-renderer';
import { CREATE_STRATEGY, DELETE_STRATEGY } from '../../../permissions';
import theme from '../../../themes/main-theme';

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <StrategiesListComponent
                    strategies={[strategy]}
                    fetchStrategies={jest.fn()}
                    removeStrategy={jest.fn()}
                    deprecateStrategy={jest.fn()}
                    reactivateStrategy={jest.fn()}
                    history={{}}
                    hasPermission={permission => [CREATE_STRATEGY, DELETE_STRATEGY].indexOf(permission) !== -1}
                />
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
                <StrategiesListComponent
                    strategies={[strategy]}
                    fetchStrategies={jest.fn()}
                    removeStrategy={jest.fn()}
                    deprecateStrategy={jest.fn()}
                    reactivateStrategy={jest.fn()}
                    history={{}}
                    hasPermission={() => false}
                />
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
