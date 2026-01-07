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
        .filter((column) => isValidFilter(searchValue, column.filterName))
        .forEach((column) => {
            const values = getFilterValues(column.filterName, searchValue);

            filteredDataSet = filteredDataSet.filter((row) => {
                if (column.filterBy) {
                    return column.filterBy(row, values);
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
        (column) => column.searchable && column.accessor,
    );

    return filteredData.filter((row) => {
        return searchableColumns.some((column) => {
            if (column.searchBy) {
                return column.searchBy(row, trimmedSearchValue);
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
        .filter((column) => column.filterName)
        .map((column) => column.filterName);

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
    columns.filter((column) => column.filterName && column.accessor);

export const getColumnValues = (column: any, row: any) => {
    const value =
        typeof column.accessor === 'function'
            ? column.accessor(row)
            : column.accessor.includes('.')
              ? column.accessor
                    .split('.')
                    .reduce((object: any, key: string) => object?.[key], row)
              : row[column.accessor];

    if (column.filterParsing) {
        return column.filterParsing(value);
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
