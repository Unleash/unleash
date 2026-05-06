import type { Row, SortingFn } from '@tanstack/react-table';

const date = <TData>(rowA: Row<TData>, rowB: Row<TData>, columnId: string) => {
    const a = new Date(
        (rowA.getValue(columnId) ?? 0) as string | number | Date,
    );
    const b = new Date(
        (rowB.getValue(columnId) ?? 0) as string | number | Date,
    );
    return b.getTime() - a.getTime();
};

const boolean = <TData>(
    rowA: Row<TData>,
    rowB: Row<TData>,
    columnId: string,
) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
    if (a === b) {
        return 0;
    }
    return a ? 1 : -1;
};

const alphanumeric = <TData>(
    rowA: Row<TData>,
    rowB: Row<TData>,
    columnId: string,
) => {
    const aVal = `${rowA.getValue(columnId) ?? ''}`.toLowerCase();
    const bVal = `${rowB.getValue(columnId) ?? ''}`.toLowerCase();
    return aVal.localeCompare(bVal);
};

const playgroundResultState = <TData>(
    rowA: Row<TData>,
    rowB: Row<TData>,
    columnId: string,
) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
    if (a === b) {
        return 0;
    }
    if (a === 'true') {
        return 1;
    }
    if (b === 'true') {
        return -1;
    }
    if (a === 'false') {
        return -1;
    }
    if (b === 'false') {
        return 1;
    }
    return 0;
};

const numericZeroLast = <TData>(
    rowA: Row<TData>,
    rowB: Row<TData>,
    columnId: string,
) => {
    const aVal =
        Number.parseInt(`${rowA.getValue(columnId) ?? 0}`, 10) ||
        Number.MAX_SAFE_INTEGER;
    const bVal =
        Number.parseInt(`${rowB.getValue(columnId) ?? 0}`, 10) ||
        Number.MAX_SAFE_INTEGER;
    return aVal - bVal;
};

export const sortingFns: Record<
    'date' | 'boolean' | 'alphanumeric' | 'playgroundResultState' | 'numericZeroLast',
    SortingFn<unknown>
> = {
    date,
    boolean,
    alphanumeric,
    playgroundResultState,
    numericZeroLast,
};
