import { useEffect } from 'react';

interface IConditionallyHiddenColumns {
    condition: boolean;
    columns: string[];
}

export const useConditionallyHiddenColumns = (
    conditionallyHiddenColumns: IConditionallyHiddenColumns[],
    setHiddenColumns: (param: string[]) => void,
    columnsDefinition: unknown[]
) => {
    useEffect(() => {
        const hiddenColumnsSet = new Set<string>();

        conditionallyHiddenColumns
            .filter(({ condition }) => condition)
            .forEach(({ columns }) =>
                columns.forEach(column => hiddenColumnsSet.add(column))
            );

        setHiddenColumns([...hiddenColumnsSet]);
    }, [
        ...conditionallyHiddenColumns.map(({ condition }) => condition),
        setHiddenColumns,
        columnsDefinition,
    ]);
};
