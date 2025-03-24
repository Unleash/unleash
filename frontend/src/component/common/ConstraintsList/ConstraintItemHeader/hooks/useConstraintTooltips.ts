import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useMemo } from 'react';

export const useConstraintTooltips = (
    contextName: string,
    values: string[],
) => {
    const { context } = useUnleashContext();
    const contextDefinition = useMemo(
        () => context.find(({ name }) => name === contextName),
        [contextName, context],
    );
    return useMemo<Record<string, string>>(
        () =>
            Object.fromEntries(
                values
                    ?.map((item) => [
                        item,
                        contextDefinition?.legalValues?.find(
                            ({ value }) => value === item,
                        )?.description,
                    ])
                    .filter(([_, tooltip]) => !!tooltip) || [],
            ),
        [context, values],
    );
};
