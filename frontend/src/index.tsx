import 'whatwg-fetch';
import 'themes/app.css';
import 'regenerator-runtime/runtime';

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
import { MessageBanner } from 'component/common/MessageBanner/MessageBanner';

window.global ||= window;

ReactDOM.render(
    <UIProviderContainer>
        <AccessProvider>
            <BrowserRouter basename={basePath}>
                <ThemeProvider>
                    <AnnouncerProvider>
                        <FeedbackCESProvider>
                            <InstanceStatus>
                                <MessageBanner />
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
