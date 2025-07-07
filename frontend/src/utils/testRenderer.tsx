import type { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
    render as rtlRender,
    type RenderOptions,
} from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'themes/ThemeProvider';
import type { IPermission } from 'interfaces/user';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { UIProviderContainer } from '../component/providers/UIProvider/UIProviderContainer.tsx';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { QueryParamProvider } from 'use-query-params';
import { FeedbackProvider } from 'component/feedbackNew/FeedbackProvider';
import { StickyProvider } from 'component/common/Sticky/StickyProvider';
import { HighlightProvider } from 'component/common/Highlight/HighlightProvider';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';

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

    const Wrapper: FC<{ children?: React.ReactNode }> = ({ children }) => (
        <SWRConfig
            value={{
                provider: () => new Map(),
                isVisible() {
                    return true;
                },
                dedupingInterval: 0,
            }}
        >
            <UIProviderContainer>
                <FeedbackProvider>
                    <AccessProviderMock permissions={permissions}>
                        <BrowserRouter>
                            <QueryParamProvider adapter={ReactRouter6Adapter}>
                                <ThemeProvider>
                                    <AnnouncerProvider>
                                        <StickyProvider>
                                            <HighlightProvider>
                                                <EventTimelineProvider>
                                                    {children}
                                                </EventTimelineProvider>
                                            </HighlightProvider>
                                        </StickyProvider>
                                    </AnnouncerProvider>
                                </ThemeProvider>
                            </QueryParamProvider>
                        </BrowserRouter>
                    </AccessProviderMock>
                </FeedbackProvider>
            </UIProviderContainer>
        </SWRConfig>
    );

    return rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};
