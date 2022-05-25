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
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { InstanceStatus } from 'component/common/InstanceStatus/InstanceStatus';

ReactDOM.render(
    <UIProvider>
        <AccessProvider>
            <BrowserRouter basename={basePath}>
                <ThemeProvider>
                    <AnnouncerProvider>
                        <FeedbackCESProvider>
                            <InstanceStatus>
                                <ScrollTop />
                                <App />
                            </InstanceStatus>
                        </FeedbackCESProvider>
                    </AnnouncerProvider>
                </ThemeProvider>
            </BrowserRouter>
        </AccessProvider>
    </UIProvider>,
    document.getElementById('app')
);
