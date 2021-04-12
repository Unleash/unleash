import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import Footer from '../Footer/Footer';
import theme from '../../../themes/main-theme';

const mockStore = {
    uiConfig: {
        toJS: () => ({
            flags: {
                P: true,
            },
        }),
    },
};

const mockReducer = state => state;

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <Provider store={createStore(mockReducer, mockStore)}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <Footer />
                </MemoryRouter>
            </ThemeProvider>
        </Provider>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <Provider store={createStore(mockReducer, mockStore)}>
            <ThemeProvider theme={theme}>
                <MemoryRouter initialEntries={['/features']}>
                    <Footer />
                </MemoryRouter>
            </ThemeProvider>
        </Provider>
    );

    expect(tree).toMatchSnapshot();
});
