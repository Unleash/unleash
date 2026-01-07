import type React from 'react';
import { type FC, useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FlagProvider, {
    LocalStorageProvider,
    UnleashClient,
} from '@unleash/proxy-client-react';
import { basePath } from '../../../utils/formatPath.ts';

const UNLEASH_API = 'https://hosted.edge.getunleash.io/api/frontend';
const DEV_TOKEN = '';

let client: UnleashClient;
let token: string;
let started: boolean = false;

export const UnleashFlagProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const getUnleashFrontendToken = (): string => {
        const el = document.querySelector<HTMLMetaElement>(
            'meta[name="unleashToken"]',
        );

        const content = el?.content ?? '::unleashToken::';
        return content === '::unleashToken::' ? DEV_TOKEN : content;
    };

    // We only want to create a single client.
    if (!client) {
        token = getUnleashFrontendToken();

        client = new UnleashClient({
            storageProvider: new LocalStorageProvider(`${basePath}:unleash`),
            url: UNLEASH_API,
            clientKey: token || 'offline',
            appName: 'Unleash Cloud UI',
        });
    }

    const { uiConfig } = useUiConfig();

    useEffect(() => {
        if (uiConfig.unleashContext && token) {
            client.updateContext(uiConfig.unleashContext);
            if (!started) {
                started = true;
                client.start();
            }
        } else {
            // nothing
        }
    }, [JSON.stringify(uiConfig.unleashContext)]);

    return (
        <FlagProvider unleashClient={client} startClient={false}>
            {children}
        </FlagProvider>
    );
};
