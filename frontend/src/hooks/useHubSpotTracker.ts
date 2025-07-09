type FlagEnabledEvent = {
    email: string;
    client_id: string;
    date: Date;
    project: string;
    environment_type: string;
};

type SdkConnectedEvent = {
    client_id: string;
    date: Date;
    // the same thing we report via the unleash-sdk header, e.g. unleash-client-js:1.0.0
    sdk: string;
    app_name: string;
};

type HubSpotEvent = FlagEnabledEvent | SdkConnectedEvent;

export const useHubSpotTracker = () => {
    const trackEvent = (event: HubSpotEvent) => {
        // todo: implement
    };

    return { trackEvent };
};
