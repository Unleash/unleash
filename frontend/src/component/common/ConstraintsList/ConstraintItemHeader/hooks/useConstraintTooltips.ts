import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext';
import { useMemo } from 'react';

export const useConstraintTooltips = (
    contextName: string,
    values: string[],
) => {
    const { context } = useAssignableUnleashContext();
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
