import { useEffect } from 'react';
import type { Updater, VisibilityState } from '@tanstack/react-table';

interface IConditionallyHiddenColumns {
    condition: boolean;
    columns: string[];
}

/**
 * Applies visibility to a tanstack-react-table instance by calling
 * `setColumnVisibility` with a `Record<string, boolean>` derived from a
 * list of `{ condition, columns }` pairs.
 */
export const useConditionallyHiddenColumns = (
    conditionallyHiddenColumns: IConditionallyHiddenColumns[],
    setColumnVisibility: (updater: Updater<VisibilityState>) => void,
    columnsDefinition: unknown[],
) => {
    useEffect(() => {
        const columnsToHide = conditionallyHiddenColumns
            .filter(({ condition }) => condition)
            .flatMap(({ columns }) => columns);

        const columnsToShow = conditionallyHiddenColumns
            .filter(({ condition }) => !condition)
            .flatMap(({ columns }) => columns);

        setColumnVisibility((current) => {
            const next = { ...current };
            for (const column of columnsToHide) {
                next[column] = false;
            }
            for (const column of columnsToShow) {
                next[column] = true;
            }
            return next;
        });
    }, [
        ...conditionallyHiddenColumns.map(({ condition }) => condition),
        setColumnVisibility,
        columnsDefinition,
    ]);
};
