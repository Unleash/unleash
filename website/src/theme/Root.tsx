import React from 'react';
import UserFeedback from '@site/src/components/UserFeedback';
import { UnleashClient } from 'unleash-proxy-client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Default implementation, that you can customize
function Root({ children }) {
    const {
        siteConfig: { customFields },
    } = useDocusaurusContext();

    const unleashConfig = {
        clientKey: customFields.unleashProxyClientKey as string,
        url: customFields.unleashProxyUrl as string,
        disableRefresh: true,
        appName: `docs.getunleash.io-${customFields.environment}`,
    };

    const [showFeedback, setShowFeedback] = React.useState(false);

    if (typeof fetch !== 'undefined') {
        try {
            const unleash = new UnleashClient(unleashConfig);
            unleash.on('ready', () => {
                setShowFeedback(unleash.isEnabled('docs-feedback-survey-v1'));
            });
            unleash.start();
        } catch (e) {
            console.warn('Unable to initialize the Unleash client:', e.message);
        }
    }

    return (
        <>
            {children}
            {showFeedback && <UserFeedback />}
        </>
    );
}

export default Root;
