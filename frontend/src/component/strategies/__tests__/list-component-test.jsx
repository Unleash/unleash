import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import StrategiesListComponent from '../StrategiesList/StrategiesList';
import renderer from 'react-test-renderer';
import theme from '../../../themes/main-theme';
import AccessProvider from '../../AccessProvider/AccessProvider';
import { createFakeStore } from '../../../accessStoreFake';
import { ADMIN } from '../../AccessProvider/permissions';

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
    };
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <AccessProvider store={createFakeStore()}>
                    <StrategiesListComponent
                        strategies={[strategy]}
                        fetchStrategies={jest.fn()}
                        removeStrategy={jest.fn()}
                        deprecateStrategy={jest.fn()}
                        reactivateStrategy={jest.fn()}
                        history={{}}
                    />
                </AccessProvider>
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
                <AccessProvider
                    store={createFakeStore([{ permission: ADMIN }])}
                >
                    <StrategiesListComponent
                        strategies={[strategy]}
                        fetchStrategies={jest.fn()}
                        removeStrategy={jest.fn()}
                        deprecateStrategy={jest.fn()}
                        reactivateStrategy={jest.fn()}
                        history={{}}
                    />
                </AccessProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
