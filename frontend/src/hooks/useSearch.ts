interface IUseSearchOutput {
    getSearchText: (input: string) => string;
    data: any[];
    getSearchContext: () => IGetSearchContextOutput;
}

export interface IGetSearchContextOutput {
    data: any[];
    columns: any[];
    searchValue: string;
}

export const useSearch = (
    columns: any[],
    searchValue: string,
    data: any[]
): IUseSearchOutput => {
    const getSearchText = getSearchTextGenerator(columns);

    const getSearchContext = () => {
        return { data, searchValue, columns };
    };

    if (!searchValue) return { data, getSearchText, getSearchContext };

    const search = () => {
        const filteredData = filter(columns, searchValue, data);
        const searchedData = searchInFilteredData(
            columns,
            getSearchText(searchValue),
            filteredData
        );

        return searchedData;
    };

    return { data: search(), getSearchText, getSearchContext };
};

export const filter = (columns: any[], searchValue: string, data: any[]) => {
    let filteredDataSet = data;

    getFilterableColumns(columns)
        .filter(column => isValidFilter(searchValue, column.filterName))
        .forEach(column => {
            const values = getFilterValues(column.filterName, searchValue);

            filteredDataSet = filteredDataSet.filter(row => {
                if (column.filterBy) {
                    return column.filterBy(row, values);
                }

                return defaultFilter(getColumnValues(column, row), values);
            });
        });

    return filteredDataSet;
};

export const searchInFilteredData = (
    columns: any[],
    searchValue: string,
    filteredData: any[]
) => {
    const searchableColumns = columns.filter(
        column => column.searchable && column.accessor
    );

    return filteredData.filter(row => {
        return searchableColumns.some(column => {
            if (column.searchBy) {
                return column.searchBy(row, searchValue);
            }

            return defaultSearch(getColumnValues(column, row), searchValue);
        });
    });
};

const defaultFilter = (fieldValue: string, values: string[]) =>
    values.some(value => fieldValue?.toLowerCase() === value?.toLowerCase());

const defaultSearch = (fieldValue: string, value: string) =>
    fieldValue?.toLowerCase().includes(value?.toLowerCase());

export const getSearchTextGenerator = (columns: any[]) => {
    const filters = columns
        .filter(column => column.filterName)
        .map(column => column.filterName);

    const isValidSearch = (fragment: string) => {
        return filters.some(filter => isValidFilter(fragment, filter));
    };

    return (searchValue: string) =>
        searchValue
            .split(' ')
            .filter(fragment => !isValidSearch(fragment))
            .join(' ');
};

export const isValidFilter = (input: string, match: string) =>
    new RegExp(`${match}:\\w+`).test(input);

export const getFilterableColumns = (columns: any[]) =>
    columns.filter(column => column.filterName && column.accessor);

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
        ?.split(' ')[0]
        ?.split(',')
        .filter(value => value) ?? [];
