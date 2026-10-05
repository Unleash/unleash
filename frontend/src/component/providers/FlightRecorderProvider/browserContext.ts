import Bowser from 'bowser';
import type { ContextEnricher } from '@unleash/sdk-flight-recorder';

export const createBrowserContextEnricher = (): ContextEnricher => {
    const { browser, os, platform } = Bowser.parse(window.navigator.userAgent);
    // No OS version: desktop browsers freeze it in the user agent.
    const browserDetails = {
        browser: browser.name,
        browserVersion: browser.version,
        os: os.name,
        deviceType: platform.type,
    };

    return (context) => ({
        ...context,
        properties: {
            ...(context.properties as Record<string, unknown> | undefined),
            ...browserDetails,
            // Read per event so resizes show.
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
        },
    });
};
