import { useEffect } from 'react';

interface IConditionallyHiddenColumns {
    condition: boolean;
    columns: string[];
}

const useConditionallyHiddenColumns = (
    conditionallyHiddenColumns: IConditionallyHiddenColumns[],
    setHiddenColumns: (param: string[]) => void,
    columnsDefinition: unknown[]
) => {
    useEffect(() => {
        const hiddenColumnsSet = new Set<string>(
            ...conditionallyHiddenColumns
                .filter(({ condition }) => condition)
                .map(({ columns }) => columns)
        );

        setHiddenColumns([...hiddenColumnsSet]);
    }, [
        ...conditionallyHiddenColumns.map(({ condition }) => condition),
        setHiddenColumns,
        columnsDefinition,
    ]);
};

export default useConditionallyHiddenColumns;
