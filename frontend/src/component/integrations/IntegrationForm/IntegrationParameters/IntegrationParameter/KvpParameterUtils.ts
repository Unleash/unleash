import type {
    AddonParameterSchema,
    AddonSchema,
    AddonTypeSchema,
} from 'openapi';

export type KeyError = 'DuplicateKey' | 'Empty' | 'WhitespaceOnly';

export type KeyValuePair = [key: string, value: string];

export const isKvpParam = ({ type }: Pick<AddonParameterSchema, 'type'>) =>
    type.toLowerCase().trim() === 'keyvaluepairs';

export const validateKeys = (
    pairs: KeyValuePair[],
): (KeyError | undefined)[] => {
    const keyCounts = {};
    for (const [key] of pairs) {
        const trimmed = key.trim();
        keyCounts[trimmed] = (keyCounts[trimmed] ?? 0) + 1;
    }

    return pairs.map(([key]) => {
        if (key.length === 0) return 'Empty';
        if (key.trim().length === 0) return 'WhitespaceOnly';
        if ((keyCounts[key.trim()] ?? 0) > 1) return 'DuplicateKey';
        return undefined;
    });
};

const mapKvpParameters = (
    providerParams: AddonTypeSchema['parameters'],
    fn: (value: unknown) => unknown,
) => {
    const kvpParams = new Set(
        providerParams?.filter(isKvpParam).map(({ name }) => name),
    );
    return (
        parameters?: AddonSchema['parameters'],
    ): AddonSchema['parameters'] => {
        return Object.fromEntries(
            Object.entries(parameters ?? {})
                .map(([key, value]) => [
                    key,
                    kvpParams.has(key) ? fn(value) : value,
                ])
                .filter(([, value]) => value !== undefined),
        );
    };
};

// KVPs are stored as objects in the db and on the wire, but as an array of
// [key, value] pairs during editing (to allow for duplicate keys)
export const kvpsToEditableForm = (
    providerParams: AddonTypeSchema['parameters'],
) => mapKvpParameters(providerParams, (value) => Object.entries(value ?? {}));

export const kvpsToStorageForm = (
    providerParams: AddonTypeSchema['parameters'],
) =>
    mapKvpParameters(providerParams, (value) => {
        if (!Array.isArray(value)) return value;
        return value.length
            ? Object.fromEntries(
                  (value as KeyValuePair[]).map(([k, v]) => [k.trim(), v]),
              )
            : undefined;
    });

export const getKvpsForParam = (
    parameters: AddonSchema['parameters'] | undefined,
    parameterName: string,
): KeyValuePair[] => {
    const value = parameters?.[parameterName];
    return Array.isArray(value) ? (value as KeyValuePair[]) : [];
};
