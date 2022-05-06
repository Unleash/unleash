import Plausible from 'plausible-tracker';
import { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IFlags } from 'interfaces/uiConfig';

const PLAUSIBLE_UNLEASH_API_HOST = 'https://plausible.getunleash.io';
const PLAUSIBLE_UNLEASH_DOMAIN = 'app.unleash-hosted.com';

export const usePlausibleTracker = () => {
    const { uiConfig } = useUiConfig();
    const enabled = enablePlausibleTracker(uiConfig.flags);

    useEffect(() => {
        if (enabled) {
            try {
                return initPlausibleTracker();
            } catch (error) {
                console.warn(error);
            }
        }
    }, [enabled]);
};

const initPlausibleTracker = (): (() => void) => {
    const plausible = Plausible({
        domain: PLAUSIBLE_UNLEASH_DOMAIN,
        apiHost: PLAUSIBLE_UNLEASH_API_HOST,
        trackLocalhost: true,
    });

    return plausible.enableAutoPageviews();
};

// Enable Plausible if we're on the Unleash SaaS domain.
export const enablePlausibleTracker = (flags: Partial<IFlags>): boolean => {
    return Boolean(flags.T);
};
