import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const useEnvironmentVisibility = () => {
    const [value, setValue] = useLocalStorageState<Array<string>>(
        'environment-visibiilty',
        [],
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
