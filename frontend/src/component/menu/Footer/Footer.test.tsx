import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import { ThemeProvider } from 'themes/ThemeProvider';

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <ThemeProvider>
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <ThemeProvider>
            <MemoryRouter initialEntries={['/features']}>
                <Footer />
            </MemoryRouter>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});
