type SerializedDates<T> = {
    [P in keyof T]: T[P] extends Date ? string : SerializedDates<T[P]>;
};

// Serialize deep-level date values to strings.
export const serializeDates = <T extends object>(
    obj: T,
): SerializedDates<T> => {
    const entries = Object.entries(obj).map(([k, v]) => {
        if (typeof v === 'object') {
            if (Array.isArray(v)) {
                return [k, v.map(serializeDates)];
            }
            if (Object.prototype.toString.call(v) === '[object Date]') {
                return [k, v.toJSON()];
            }
            return [k, serializeDates(v)];
        } else {
            return [k, v];
        }
    });

    return Object.fromEntries(entries);
};
