import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

test('should render DrawerMenu', () => {
    const tree = renderer.create(
        <ThemeProvider>
            <AnnouncerProvider>
                <MemoryRouter>
                    <Footer />
                </MemoryRouter>
            </AnnouncerProvider>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const tree = renderer.create(
        <ThemeProvider>
            <AnnouncerProvider>
                <MemoryRouter initialEntries={['/features']}>
                    <Footer />
                </MemoryRouter>
            </AnnouncerProvider>
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});
