import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';

type OptionType = {
    key: string;
    label: string;
    description?: string;
};

const DEFAULT_RANDOM_OPTION = 'random';
const DEFAULT_STICKINESS_OPTION = 'default';

export const useStickinessOptions = (value: string | undefined) => {
    const { context } = useUnleashContext();

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

    return options;
};
