import { useEffect } from 'react';
import { IdType } from 'react-table';

const useHiddenColumns = (
    setHiddenColumns: <D>(param: Array<IdType<D>>) => void,
    hiddenColumns: string[],
    condition: boolean
) => {
    useEffect(() => {
        const hidden = condition ? hiddenColumns : [];
        setHiddenColumns(hidden);
    }, [setHiddenColumns, hiddenColumns, condition]);
};

export default useHiddenColumns;
