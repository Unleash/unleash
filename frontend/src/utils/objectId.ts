// Get a unique ID for an object instance.
export const objectId = (value: object): number => {
    if (!ids.has(value)) {
        id++;
        ids.set(value, id);
    }

    return ids.get(value)!;
};

const ids = new WeakMap<object, number>();
let id = 0;
