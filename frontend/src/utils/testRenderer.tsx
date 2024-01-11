import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'themes/ThemeProvider';
import { IPermission } from 'interfaces/user';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { UIProviderContainer } from '../component/providers/UIProvider/UIProviderContainer';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { QueryParamProvider } from 'use-query-params';
import { FeedbackProvider } from 'component/feedbackNew/FeedbackProvider';

export const render = (
    ui: JSX.Element,
    {
        route = '/',
        permissions = [],
        ...renderOptions
    }: { route?: string; permissions?: IPermission[] } & Omit<
        RenderOptions,
        'queries'
    > = {},
) => {
    if (!route.startsWith('/')) {
        throw new Error('Route must start with a /');
    }

    window.history.pushState({}, 'Test page', route);

    const Wrapper: FC = ({ children }) => (
        <UIProviderContainer>
            <FeedbackProvider>
                <SWRConfig
                    value={{ provider: () => new Map(), dedupingInterval: 0 }}
                >
                    <AccessProviderMock permissions={permissions}>
                        <BrowserRouter>
                            <QueryParamProvider adapter={ReactRouter6Adapter}>
                                <ThemeProvider>
                                    <AnnouncerProvider>
                                        {children}
                                    </AnnouncerProvider>
                                </ThemeProvider>
                            </QueryParamProvider>
                        </BrowserRouter>
                    </AccessProviderMock>
                </SWRConfig>
            </FeedbackProvider>
        </UIProviderContainer>
    );

    return rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};
