interface OmitKeys {
    <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
        [K2 in Exclude<keyof T, K[number]>]: T[K2];
    };
}

// https://stackoverflow.com/questions/53966509/typescript-type-safe-omit-function
export const omitKeys: OmitKeys = (obj, ...keys) => {
    const ret = {} as {
        [K in keyof typeof obj]: typeof obj[K];
    };

    let key: keyof typeof obj;

    for (key in obj) {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }

    return ret;
};
