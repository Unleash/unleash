import type { SdkContextSchema } from '../../openapi/index.js';

export const cleanContext = (
    context: SdkContextSchema,
): { context: SdkContextSchema; removedProperties: string[] } => {
    const { appName, ...otherContextFields } = context;
    const removedProperties: string[] = [];

    const cleanedContextFields = Object.fromEntries(
        Object.entries(otherContextFields).filter(([key, value]) => {
            if (key === 'properties' || typeof value === 'string') {
                return true;
            }
            removedProperties.push(key);
            return false;
        }),
    );

    return {
        context: {
            ...cleanedContextFields,
            appName,
        },
        removedProperties,
    };
};
