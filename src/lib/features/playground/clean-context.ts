import type { SdkContextSchema } from '../../openapi';

export const cleanContext = (context: SdkContextSchema): SdkContextSchema => {
    const { appName, ...otherContextFields } = context;

    const cleanedContextFields = Object.fromEntries(
        Object.entries(otherContextFields).filter(
            ([key, value]) => key === 'properties' || typeof value === 'string',
        ),
    );

    return {
        ...cleanedContextFields,
        appName,
    };
};
