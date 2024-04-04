import type { SdkContextSchema } from '../../openapi';

export const cleanContext = (context: SdkContextSchema): SdkContextSchema => {
    const { appName, properties, ...otherContextFields } = context;

    const removedContextFields: string[] = [];
    const cleanedContextFields = Object.fromEntries(
        Object.entries(otherContextFields).filter(([key, value]) => {
            if (typeof value === 'string') {
                return true;
            } else {
                removedContextFields.push(key);
                return false;
            }
        }),
    );

    return {
        ...cleanedContextFields,
        appName,
        properties,
    };
};
