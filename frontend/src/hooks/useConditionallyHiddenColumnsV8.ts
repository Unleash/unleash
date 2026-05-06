import { useEffect } from 'react';
import type { Updater, VisibilityState } from '@tanstack/react-table';

interface IConditionallyHiddenColumns {
    condition: boolean;
    columns: string[];
}

/**
 * v8 counterpart of `useConditionallyHiddenColumns`. Applies visibility
 * directly via the table's `setColumnVisibility`, which expects a
 * `Record<string, boolean>` rather than v7's `string[]` of hidden ids.
 */
export const useConditionallyHiddenColumnsV8 = (
    conditionallyHiddenColumns: IConditionallyHiddenColumns[],
    setColumnVisibility: (updater: Updater<VisibilityState>) => void,
    columnsDefinition: unknown[],
) => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: spreading the conditions array into deps is intentional so the effect re-runs when any condition flips
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
