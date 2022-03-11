export const collectIds = <T>(items: { id?: T }[]): T[] => {
    return items.map((item) => item.id);
};
