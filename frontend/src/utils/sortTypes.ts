import { IdType, Row } from 'react-table';

/**
 * For `react-table`.
 *
 * @see https://react-table.tanstack.com/docs/api/useSortBy#table-options
 */
export const sortTypes = {
    date: <D extends object>(
        v1: Row<D>,
        v2: Row<D>,
        id: IdType<D>,
        _desc?: boolean
    ) => {
        const a = new Date(v1?.values?.[id] || 0);
        const b = new Date(v2?.values?.[id] || 0);
        return b?.getTime() - a?.getTime(); // newest first by default
    },
    boolean: <D extends object>(
        v1: Row<D>,
        v2: Row<D>,
        id: IdType<D>,
        _desc?: boolean
    ) => {
        const a = v1?.values?.[id];
        const b = v2?.values?.[id];
        return a === b ? 0 : a ? 1 : -1;
    },
    alphanumeric: <D extends object>(
        a: Row<D>,
        b: Row<D>,
        id: IdType<D>,
        _desc?: boolean
    ) => {
        const aVal = `${a?.values?.[id] || ''}`.toLowerCase();
        const bVal = `${b?.values?.[id] || ''}`.toLowerCase();
        return aVal?.localeCompare(bVal);
    },
    playgroundResultState: <D extends object>(
        v1: Row<D>,
        v2: Row<D>,
        id: IdType<D>,
        _desc?: boolean
    ) => {
        const a = v1?.values?.[id];
        const b = v2?.values?.[id];
        if (a === b) return 0;
        if (a === 'true') return 1;
        if (b === 'true') return -1;
        if (a === 'false') return -1;
        if (b === 'false') return 1;
        return 0;
    },
};
