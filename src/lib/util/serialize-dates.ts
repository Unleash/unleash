type SerializedDates<T> = {
    [P in keyof T]: T[P] extends Date ? string : SerializedDates<T[P]>;
};

// Disallow array arguments for serializeDates.
// Use `array.map(serializeDates)` instead.
type NotArray<T> = Exclude<T, unknown[]>;

// Serialize top-level date values to strings.
export const serializeDates = <T extends object>(
    obj: NotArray<T>,
): SerializedDates<T> => {
    if (obj != null) {
        const entries = Object.entries(obj).map(([k, v]) => {
            if (typeof v === 'object') {
                if (Array.isArray(v)) {
                    if (v.length > 0) return [k, v.map(serializeDates)];
                    else return [k, v];
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
    }
    return obj as any;
};
