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
        const { hidden, shown } = Object.groupBy(
            conditionallyHiddenColumns,
            ({ condition }) => (condition ? 'hidden' : 'shown'),
        );

        const columnsToHide = hidden?.flatMap(({ columns }) => columns) ?? [];
        const columnsToShow = shown?.flatMap(({ columns }) => columns) ?? [];

        setColumnVisibility((current) => {
            const next = { ...current };
            for (const column of columnsToShow) {
                next[column] = true;
            }
            for (const column of columnsToHide) {
                next[column] = false;
            }
            return next;
        });
    }, [
        ...conditionallyHiddenColumns.map(({ condition }) => condition),
        setColumnVisibility,
        columnsDefinition,
    ]);
};
