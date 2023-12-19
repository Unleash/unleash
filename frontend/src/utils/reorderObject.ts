export const reorderObject = <T extends object>(obj: T, order: string[]): T => {
    // Create a set for quick lookup of the ordered keys
    const orderSet = new Set(order);

    const orderedObj: Partial<T> = {};

    // Add explicitly ordered keys to the ordered object
    order.forEach((key) => {
        if (key in obj) {
            orderedObj[key as keyof T] = obj[key as keyof T];
        }
    });

    // Add remaining keys that were not explicitly ordered
    Object.keys(obj).forEach((key) => {
        if (!orderSet.has(key)) {
            orderedObj[key as keyof T] = obj[key as keyof T];
        }
    });

    return orderedObj as T;
};
