import 'whatwg-fetch';
import 'themes/app.css';
import 'regenerator-runtime/runtime';

import { Fragment, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'themes/ThemeProvider';
import { App } from 'component/App';
import { ScrollTop } from 'component/common/ScrollTop/ScrollTop';
import { AccessProvider } from 'component/providers/AccessProvider/AccessProvider';
import { basePath } from 'utils/formatPath';
import { FeedbackCESProvider } from 'component/feedback/FeedbackCESContext/FeedbackCESProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { InstanceStatus } from 'component/common/InstanceStatus/InstanceStatus';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';

const MessageBanner = lazy(() =>
    import('component/common/MessageBanner/MessageBanner').then(module => ({
        default: module.MessageBanner,
    }))
);

window.global ||= window;

ReactDOM.render(
    <UIProviderContainer>
        <AccessProvider>
            <BrowserRouter basename={basePath}>
                <ThemeProvider>
                    <AnnouncerProvider>
                        <FeedbackCESProvider>
                            <InstanceStatus>
                                <Suspense fallback={null}>
                                    <MessageBanner />
                                </Suspense>
                                <ScrollTop />
                                <App />
                            </InstanceStatus>
                        </FeedbackCESProvider>
                    </AnnouncerProvider>
                </ThemeProvider>
            </BrowserRouter>
        </AccessProvider>
    </UIProviderContainer>,
    document.getElementById('app')
);
