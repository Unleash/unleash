import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'themes/ThemeProvider';
import { IPermission } from 'interfaces/user';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';

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
            <AccessProviderMock permissions={permissions}>
                <ThemeProvider>
                    <AnnouncerProvider>
                        <BrowserRouter>{children}</BrowserRouter>
                    </AnnouncerProvider>
                </ThemeProvider>
            </AccessProviderMock>
        </SWRConfig>
    );

    return rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};
