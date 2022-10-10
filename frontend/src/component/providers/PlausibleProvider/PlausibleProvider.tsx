import { FC, useState, useEffect } from 'react';
import Plausible from 'plausible-tracker';
import { PlausibleContext } from 'contexts/PlausibleContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const PLAUSIBLE_UNLEASH_API_HOST = 'https://plausible.getunleash.io';
const PLAUSIBLE_UNLEASH_DOMAIN = 'app.unleash-hosted.com';
const LOCAL_TESTING = false;

export const PlausibleProvider: FC = ({ children }) => {
    const [context, setContext] = useState<ReturnType<typeof Plausible> | null>(
        null
    );
    const { uiConfig } = useUiConfig();
    const isEnabled = Boolean(uiConfig?.flags?.T || LOCAL_TESTING);

    useEffect(() => {
        if (isEnabled) {
            try {
                const plausible = Plausible({
                    domain: LOCAL_TESTING
                        ? undefined
                        : PLAUSIBLE_UNLEASH_DOMAIN,
                    apiHost: LOCAL_TESTING
                        ? 'http://localhost:8000'
                        : PLAUSIBLE_UNLEASH_API_HOST,
                    trackLocalhost: true,
                });
                setContext(() => plausible);
                return plausible.enableAutoPageviews();
            } catch (error) {
                console.warn(error);
            }
        }
    }, [isEnabled]);

    return (
        <PlausibleContext.Provider value={context}>
            {children}
        </PlausibleContext.Provider>
    );
};
