import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { MainThemeProvider } from 'themes/MainThemeProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { IPermission } from 'interfaces/user';
import AccessProvider from 'component/providers/AccessProvider/AccessProvider';

export const render = (
    ui: JSX.Element,
    {
        route = '/',
        permissions = [],
        ...renderOptions
    }: { route?: string; permissions?: IPermission[] } & Omit<
        RenderOptions,
        'queries'
    > = {}
) => {
    window.history.pushState({}, 'Test page', route);

    const Wrapper: FC = ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>
            <AccessProvider permissions={permissions}>
                <AnnouncerProvider>
                    <MainThemeProvider>
                        <Router>{children}</Router>
                    </MainThemeProvider>
                </AnnouncerProvider>
            </AccessProvider>
        </SWRConfig>
    );

    return rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};
