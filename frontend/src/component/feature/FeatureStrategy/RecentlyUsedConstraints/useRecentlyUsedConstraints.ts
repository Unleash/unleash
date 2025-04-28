import { useLocalStorageState } from '../../../../hooks/useLocalStorageState';
import type { IConstraint } from '../../../../interfaces/strategy';

export const areConstraintsEqual = (
    a: IConstraint,
    b: IConstraint,
): boolean => {
    const aJson = JSON.stringify({
        contextName: a.contextName,
        operator: a.operator,
        values: a.values,
        value: a.value,
        inverted: a.inverted,
        caseInsensitive: a.caseInsensitive,
    });

    const bJson = JSON.stringify({
        contextName: b.contextName,
        operator: b.operator,
        values: b.values,
        value: b.value,
        inverted: b.inverted,
        caseInsensitive: b.caseInsensitive,
    });

    return aJson === bJson;
};

export const useRecentlyUsedConstraints = (
    key: string,
    initialItems: IConstraint[] = [],
) => {
    const [items, setItems] = useLocalStorageState<IConstraint[]>(
        `recently-used-constraints-${key}`,
        initialItems,
    );

    const addItem = (newItem: IConstraint) => {
        setItems((prevItems) => {
            const filteredItems = prevItems.filter(
                (item) => !areConstraintsEqual(item, newItem),
            );

            const updatedItems = [newItem, ...filteredItems];
            return updatedItems.slice(0, 3);
        });
    };

    return {
        items,
        addItem,
    };
};
