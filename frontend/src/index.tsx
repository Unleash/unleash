import 'whatwg-fetch';
import 'themes/app.css';
import 'regenerator-runtime/runtime';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { ThemeProvider } from 'themes/ThemeProvider';
import { App } from 'component/App';
import { ScrollTop } from 'component/common/ScrollTop/ScrollTop';
import { AccessProvider } from 'component/providers/AccessProvider/AccessProvider';
import { basePath } from 'utils/formatPath';
import { FeedbackCESProvider } from 'component/feedback/FeedbackCESContext/FeedbackCESProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';
import { InstanceStatus } from 'component/common/InstanceStatus/InstanceStatus';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';
import { StickyProvider } from 'component/common/Sticky/StickyProvider';
import { FeedbackProvider } from 'component/feedbackNew/FeedbackProvider';
import { PlausibleProvider } from 'component/providers/PlausibleProvider/PlausibleProvider';
import { Error as LayoutError } from './component/layout/Error/Error';
import { ErrorBoundary } from 'react-error-boundary';
import { useRecordUIErrorApi } from 'hooks/api/actions/useRecordUIErrorApi/useRecordUiErrorApi';

window.global ||= window;

const ApplicationRoot = () => {
    const { recordUiError } = useRecordUIErrorApi();

    const sendErrorToApi = async (
        error: Error,
        info: { componentStack: string },
    ) => {
        try {
            await recordUiError({
                errorMessage: error.message,
                errorStack: error.stack || '',
            });
        } catch (e) {
            console.error('Unable to log error');
        }
    };

    return (
        <UIProviderContainer>
            <AccessProvider>
                <BrowserRouter basename={basePath}>
                    <QueryParamProvider adapter={ReactRouter6Adapter}>
                        <ThemeProvider>
                            <AnnouncerProvider>
                                <ErrorBoundary
                                    FallbackComponent={LayoutError}
                                    onError={sendErrorToApi}
                                >
                                    <PlausibleProvider>
                                        <FeedbackProvider>
                                            <FeedbackCESProvider>
                                                <StickyProvider>
                                                    <InstanceStatus>
                                                        <ScrollTop />
                                                        <App />
                                                    </InstanceStatus>
                                                </StickyProvider>
                                            </FeedbackCESProvider>
                                        </FeedbackProvider>
                                    </PlausibleProvider>
                                </ErrorBoundary>
                            </AnnouncerProvider>
                        </ThemeProvider>
                    </QueryParamProvider>
                </BrowserRouter>
            </AccessProvider>
        </UIProviderContainer>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<ApplicationRoot />);
