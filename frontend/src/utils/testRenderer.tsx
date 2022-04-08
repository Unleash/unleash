import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { MainThemeProvider } from 'themes/MainThemeProvider';

export const render = (
    ui: JSX.Element,
    {
        route = '/',
        ...renderOptions
    }: { route?: string } & Omit<RenderOptions, 'queries'> = {}
) => {
    window.history.pushState({}, 'Test page', route);

    return rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};

const Wrapper: FC = ({ children }) => {
    return (
        <SWRConfig value={{ provider: () => new Map() }}>
            <MainThemeProvider>
                <Router>{children}</Router>
            </MainThemeProvider>
        </SWRConfig>
    );
};
