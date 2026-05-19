// Distributive over unions: Date|undefined → string|undefined, object → any, primitive → itself
type SerializeDateValue<V> = V extends Date
    ? string
    : V extends object
      ? any
      : V;

type SerializedDates<T> = T extends Date
    ? string
    : T extends (infer U)[]
      ? SerializedDates<U>[]
      : T extends object
        ? { [P in keyof T]: SerializeDateValue<T[P]> }
        : T;

// Convert Date objects to strings recursively.
export const serializeDates = <T>(obj: T): SerializedDates<T> => {
    if (!obj || typeof obj !== 'object') {
        return obj as SerializedDates<T>;
    }

    if (Array.isArray(obj)) {
        return obj.map(serializeDates) as unknown as SerializedDates<T>;
    }

    const entries = Object.entries(obj).map(([k, v]) => {
        if (v instanceof Date) {
            return [k, v.toJSON()];
        } else {
            return [k, serializeDates(v)];
        }
    });

    return Object.fromEntries(entries);
};
