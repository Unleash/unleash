import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import Footer from '../Footer/Footer';
import theme from 'themes/mainTheme';

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={['/features']}>
                <Footer />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});
