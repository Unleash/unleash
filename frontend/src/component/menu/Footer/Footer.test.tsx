import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer.tsx';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

test('should render DrawerMenu', () => {
    const { asFragment } = render(
        <ThemeProvider>
            <AnnouncerProvider>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Footer />
                </MemoryRouter>
            </AnnouncerProvider>
        </ThemeProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
});

test('should render DrawerMenu with "features" selected', () => {
    const { asFragment } = render(
        <ThemeProvider>
            <AnnouncerProvider>
                <MemoryRouter
                    initialEntries={['/features']}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Footer />
                </MemoryRouter>
            </AnnouncerProvider>
        </ThemeProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
});
