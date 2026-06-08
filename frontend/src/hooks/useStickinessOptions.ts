import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext';

type OptionType = {
    key: string;
    label: string;
    description?: string;
};

const DEFAULT_RANDOM_OPTION = 'random';
const DEFAULT_STICKINESS_OPTION = 'default';

export const useStickinessOptions = (value: string | undefined) => {
    const { context } = useAssignableUnleashContext();

    const options = context
        .filter((field) => field.stickiness)
        .map((c) => ({
            key: c.name,
            label: c.name,
            description: c.description,
        })) as OptionType[];

    if (
        !options.find((option) => option.key === 'default') &&
        !context.find((field) => field.name === DEFAULT_STICKINESS_OPTION)
    ) {
        options.push({
            key: 'default',
            label: 'Default',
            description:
                'Default stickiness will choose the first value present in the following order: userId, sessionId, random.',
        });
    }

    if (
        !options.find((option) => option.key === 'random') &&
        !context.find((field) => field.name === DEFAULT_RANDOM_OPTION)
    ) {
        options.push({
            key: 'random',
            label: 'random',
            description: 'Random distribution with no stickiness.',
        });
    }

    // Add existing value to the options
    if (value && !options.find((option) => option.key === value)) {
        options.push({
            key: value,
            label: value,
        });
    }

    // Sort so that `default` always comes first, followed by the other
    // built-in system stickiness options, and finally any custom options.
    const SYSTEM_STICKINESS_ORDER = [
        DEFAULT_STICKINESS_OPTION,
        'userId',
        'sessionId',
        DEFAULT_RANDOM_OPTION,
    ];
    const rank = (key: string) => {
        const index = SYSTEM_STICKINESS_ORDER.indexOf(key);
        return index === -1 ? SYSTEM_STICKINESS_ORDER.length : index;
    };

    options.sort((a, b) => rank(a.key) - rank(b.key));

    return options;
};
