import { useEffect } from 'react';

interface IConditionallyHiddenColumns {
    condition: boolean;
    columns: string[];
}

export const useConditionallyHiddenColumns = (
    conditionallyHiddenColumns: IConditionallyHiddenColumns[],
    setHiddenColumns: (
        columns: string[] | ((columns: string[]) => string[])
    ) => void,
    columnsDefinition: unknown[]
) => {
    useEffect(() => {
        const columnsToHide = conditionallyHiddenColumns
            .filter(({ condition }) => condition)
            .flatMap(({ columns }) => columns);

        const columnsToShow = conditionallyHiddenColumns
            .flatMap(({ columns }) => columns)
            .filter(column => !columnsToHide.includes(column));

        setHiddenColumns(columns => [
            ...new Set(
                [...columns, ...columnsToHide].filter(
                    column => !columnsToShow.includes(column)
                )
            ),
        ]);
    }, [
        ...conditionallyHiddenColumns.map(({ condition }) => condition),
        setHiddenColumns,
        columnsDefinition,
    ]);
};
