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
import { LayoutError } from './component/layout/Error/LayoutError.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import { useRecordUIErrorApi } from 'hooks/api/actions/useRecordUIErrorApi/useRecordUiErrorApi';
import { HighlightProvider } from 'component/common/Highlight/HighlightProvider';
import { UnleashFlagProvider } from 'component/providers/UnleashFlagProvider/UnleashFlagProvider';
import { WelcomeDialogProvider } from 'component/personalDashboard/WelcomeDialogProvider.tsx';

window.global ||= window;

const ApplicationRoot = () => {
    const { recordUiError } = useRecordUIErrorApi();

    const sendErrorToApi = async (
        error: Error,
        _info: { componentStack: string },
    ) => {
        try {
            await recordUiError({
                errorMessage: error.message,
                errorStack: error.stack || '',
            });
        } catch (_e) {
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
                                <PlausibleProvider>
                                    <UnleashFlagProvider>
                                        <ErrorBoundary
                                            FallbackComponent={LayoutError}
                                            onError={sendErrorToApi}
                                        >
                                            <FeedbackProvider>
                                                <FeedbackCESProvider>
                                                    <StickyProvider>
                                                        <HighlightProvider>
                                                            <WelcomeDialogProvider>
                                                                <InstanceStatus>
                                                                    <ScrollTop />
                                                                    <App />
                                                                </InstanceStatus>
                                                            </WelcomeDialogProvider>
                                                        </HighlightProvider>
                                                    </StickyProvider>
                                                </FeedbackCESProvider>
                                            </FeedbackProvider>
                                        </ErrorBoundary>
                                    </UnleashFlagProvider>
                                </PlausibleProvider>
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
