import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { createLocalStorage } from 'utils/createLocalStorage';

// Reading legacy value will be safely refactored out in a next version - related to `flagOverviewRedesign` flag
const { value: legacyStoreValue } = createLocalStorage<{
    hiddenEnvironments?: Array<string>;
}>('global:v1', {});

export const useEnvironmentVisibility = () => {
    const [value, setValue] = useLocalStorageState<Array<string>>(
        'environment-visibiilty',
        legacyStoreValue?.hiddenEnvironments || [],
    );
    const { trackEvent } = usePlausibleTracker();

    const onEnvironmentVisibilityChange = (environment: string) => {
        if (value.includes(environment)) {
            setValue(value.filter((env) => env !== environment));
            trackEvent('hidden_environment', {
                props: {
                    eventType: `environment unhidden`,
                },
            });
        } else {
            setValue([...value, environment]);
            trackEvent('hidden_environment', {
                props: {
                    eventType: `environment hidden`,
                },
            });
        }
    };

    return {
        hiddenEnvironments: value,
        onEnvironmentVisibilityChange,
    };
};
