type SerializedDates<T> = {
    [P in keyof T]: T[P] extends Date ? string : T[P];
};

// Serialize top-level date values to strings.
export const serializeDates = <T extends object>(
    obj: T,
): SerializedDates<T> => {
    const entries = Object.entries(obj).map(([k, v]) => {
        if (v instanceof Date) {
            return [k, v.toJSON()];
        } else {
            return [k, v];
        }
    });

    return Object.fromEntries(entries);
};
