import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from 'themes/mainTheme';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

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

const Wrapper: React.FC = ({ children }) => {
    return (
        <SWRConfig value={{ provider: () => new Map() }}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </BrowserRouter>
        </SWRConfig>
    );
};
