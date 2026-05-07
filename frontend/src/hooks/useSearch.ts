import { useCallback, useMemo } from 'react';

export type IGetSearchContextOutput<T = any> = {
    data: T[];
    columns: any[];
    searchValue: string;
};

type IUseSearchOutput<T> = {
    getSearchText: (input: string) => string;
    data: T[];
    getSearchContext: () => IGetSearchContextOutput<T>;
};

// https://stackoverflow.com/questions/9577930/regular-expression-to-select-all-whitespace-that-isnt-in-quotes
const SPACES_WITHOUT_QUOTES = /\s+(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/g;

const normalizeSearchValue = (value: string) =>
    value.replaceAll(/\s*,\s*/g, ',');

const removeQuotes = (value: string) =>
    value.replaceAll("'", '').replaceAll('"', '');

// Cell shape sniffing: v7 columns expose fields at the top level; v8 columns
// (`@tanstack/react-table`) put accessors under `accessorKey`/`accessorFn` and
// custom fields under `meta`. These getters read both, so callers can pass
// either shape during the v7 -> v8 migration.
const getAccessor = (column: any): unknown =>
    column.accessorFn ?? column.accessorKey ?? column.accessor;
const getSearchable = (column: any): boolean | undefined =>
    column.meta?.searchable ?? column.searchable;
const getFilterName = (column: any): string | undefined =>
    column.meta?.filterName ?? column.filterName;
const getFilterBy = (
    column: any,
): ((row: any, values: string[]) => boolean) | undefined =>
    column.meta?.filterBy ?? column.filterBy;
const getSearchBy = (
    column: any,
): ((row: any, value: string) => boolean) | undefined =>
    column.meta?.searchBy ?? column.searchBy;
const getFilterParsing = (column: any): ((value: any) => string) | undefined =>
    column.meta?.filterParsing ?? column.filterParsing;

export const useSearch = <T>(
    columns: any[],
    searchValue: string,
    data: T[],
): IUseSearchOutput<T> => {
    const getSearchText = useCallback(
        (value: string) =>
            removeQuotes(
                getSearchTextGenerator(columns)(normalizeSearchValue(value)),
            ),
        [columns],
    );
    const normalizedSearchValue = normalizeSearchValue(searchValue);

    const getSearchContext = useCallback(() => {
        return { data, searchValue: normalizedSearchValue, columns };
    }, [data, normalizedSearchValue, columns]);

    const search = useMemo(() => {
        if (!normalizedSearchValue) return data;

        const filteredData = filter(columns, normalizedSearchValue, data);
        const searchedData = searchInFilteredData(
            columns,
            getSearchText(normalizedSearchValue),
            filteredData,
        );

        return searchedData;
    }, [columns, normalizedSearchValue, data, getSearchText]);

    return { data: search, getSearchText, getSearchContext };
};

export const filter = (columns: any[], searchValue: string, data: any[]) => {
    let filteredDataSet = data;

    getFilterableColumns(columns)
        .filter((column) => isValidFilter(searchValue, getFilterName(column)!))
        .forEach((column) => {
            const filterName = getFilterName(column)!;
            const values = getFilterValues(filterName, searchValue);

            filteredDataSet = filteredDataSet.filter((row) => {
                const filterBy = getFilterBy(column);
                if (filterBy) {
                    return filterBy.call(column, row, values);
                }

                return defaultFilter(getColumnValues(column, row), values);
            });
        });

    return filteredDataSet;
};

export const searchInFilteredData = <T>(
    columns: any[],
    searchValue: string,
    filteredData: T[],
) => {
    const trimmedSearchValue = searchValue.trim();
    const searchableColumns = columns.filter(
        (column) => getSearchable(column) && getAccessor(column),
    );

    return filteredData.filter((row) => {
        return searchableColumns.some((column) => {
            const searchBy = getSearchBy(column);
            if (searchBy) {
                return searchBy.call(column, row, trimmedSearchValue);
            }

            return defaultSearch(
                getColumnValues(column, row),
                trimmedSearchValue,
            );
        });
    });
};

const defaultFilter = (fieldValue: string, values: string[]) =>
    values.some((value) => fieldValue?.toLowerCase() === value?.toLowerCase());

export const includesFilter = (fieldValue: string, values: string[]) =>
    values.some((value) =>
        fieldValue?.toLowerCase().includes(value?.toLowerCase()),
    );

const defaultSearch = (fieldValue: string, value: string) =>
    fieldValue?.toLowerCase().includes(value?.toLowerCase());

export const getSearchTextGenerator = (columns: any[]) => {
    const filters = columns
        .map((column) => getFilterName(column))
        .filter((filterName): filterName is string => Boolean(filterName));

    const isValidSearch = (fragment: string) => {
        return filters.some((filter) => isValidFilter(fragment, filter));
    };

    return (searchValue: string) =>
        searchValue
            .split(SPACES_WITHOUT_QUOTES)
            .filter((fragment) => !isValidSearch(fragment))
            .join(' ');
};

export const isValidFilter = (input: string, match: string) =>
    // name:"hello world" or name:'hello world' or name:simple
    new RegExp(`${match}:(?:\\w+|["'][^"']+["'])`).test(input);

export const getFilterableColumns = (columns: any[]) =>
    columns.filter((column) => getFilterName(column) && getAccessor(column));

export const getColumnValues = (column: any, row: any) => {
    const accessor = getAccessor(column);
    const value =
        typeof accessor === 'function'
            ? accessor(row)
            : typeof accessor === 'string' && accessor.includes('.')
              ? accessor
                    .split('.')
                    .reduce((object: any, key: string) => object?.[key], row)
              : typeof accessor === 'string'
                ? row[accessor]
                : undefined;

    const filterParsing = getFilterParsing(column);
    if (filterParsing) {
        return filterParsing(value);
    }

    return value;
};

export const getFilterValues = (filterName: string, searchValue: string) =>
    searchValue
        ?.split(`${filterName}:`)[1]
        ?.split(SPACES_WITHOUT_QUOTES)[0]
        ?.split(',')
        .map(removeQuotes)
        .filter((value) => value) ?? [];
