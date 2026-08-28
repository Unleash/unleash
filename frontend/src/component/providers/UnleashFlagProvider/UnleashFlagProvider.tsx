import type React from 'react';
import { type FC, useContext, useEffect, useRef } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FlagProvider, {
    InMemoryStorageProvider,
    LocalStorageProvider,
    UnleashClient,
} from '@unleash/proxy-client-react';
import { EVENTS } from 'unleash-proxy-client';
import type { ImpressionEvent } from '@unleash/sdk-flight-recorder';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import { basePath } from '../../../utils/formatPath.ts';

const UNLEASH_API = 'https://hosted.edge.getunleash.io/api/frontend';
const DEV_TOKEN = '';

let client: UnleashClient;
let token: string;

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

    const flightRecorder = useContext(FlightRecorderContext);
    const flightRecorderRef = useRef(flightRecorder);
    flightRecorderRef.current = flightRecorder;

    // We only want to create a single client.
    if (!client) {
        token = getUnleashFrontendToken();

        client = new UnleashClient({
            storageProvider: token
                ? new LocalStorageProvider(`${basePath}:unleash`)
                : new InMemoryStorageProvider(),
            url: UNLEASH_API,
            clientKey: token || 'offline',
            appName: 'Unleash Cloud UI',
        });

        client.on(EVENTS.IMPRESSION, (event: ImpressionEvent) => {
            flightRecorderRef.current?.record(event);
        });

        if (token) {
            client.start();
        }
    }

    const { uiConfig } = useUiConfig();

    useEffect(() => {
        if (uiConfig.unleashContext && token) {
            client.updateContext(uiConfig.unleashContext);
        }
    }, [JSON.stringify(uiConfig.unleashContext)]);

    return (
        <FlagProvider unleashClient={client} startClient={false}>
            {children}
        </FlagProvider>
    );
};
