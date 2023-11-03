const splitInputQuery = (searchString: string): string[] =>
    searchString.trim().split(/ (?=\w+:)/);

const isFilter = (part: string): boolean => part.includes(':');

const isStatusFilter = (key: string, values: string[]): boolean =>
    values.every((value) => value === 'enabled' || value === 'disabled');

const addStatusFilters = (
    key: string,
    values: string[],
    filterParams: Record<string, string | string[]>,
): Record<string, string | string[]> => {
    const newStatuses = values.map((value) => `${key}:${value}`);
    return {
        ...filterParams,
        status: [...(filterParams.status || []), ...newStatuses],
    };
};

const addTagFilters = (
    values: string[],
    filterParams: Record<string, string | string[]>,
): Record<string, string | string[]> => ({
    ...filterParams,
    tag: [...(filterParams.tag || []), ...values],
});

const addRegularFilters = (
    key: string,
    values: string[],
    filterParams: Record<string, string | string[]>,
): Record<string, string | string[]> => ({
    ...filterParams,
    [key]: [...(filterParams[key] || []), ...values],
});

const handleFilter = (
    part: string,
    filterParams: Record<string, string | string[]>,
): Record<string, string | string[]> => {
    const [key, ...valueParts] = part.split(':');
    const valueString = valueParts.join(':').trim();
    const values = valueString.split(',').map((value) => value.trim());

    if (isStatusFilter(key, values)) {
        return addStatusFilters(key, values, filterParams);
    } else if (key === 'tag') {
        return addTagFilters(values, filterParams);
    } else {
        return addRegularFilters(key, values, filterParams);
    }
};

const handleSearchTerm = (
    part: string,
    filterParams: Record<string, string | string[]>,
): Record<string, string | string[]> => ({
    ...filterParams,
    query: filterParams.query
        ? `${filterParams.query} ${part.trim()}`
        : part.trim(),
});

const appendFilterParamsToQueryParts = (
    params: Record<string, string | string[]>,
): string[] => {
    let newQueryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            newQueryParts = [
                ...newQueryParts,
                ...value.map((item) => `${key}[]=${item}`),
            ];
        } else {
            newQueryParts.push(`${key}=${value}`);
        }
    }

    return newQueryParts;
};

const convertToQueryString = (
    params: Record<string, string | string[]>,
): string => {
    const { query, ...filterParams } = params; // Destructure to separate query and filterParams
    let queryParts: string[] = [];

    if (query) {
        queryParts.push(`query=${query}`);
    }

    queryParts = queryParts.concat(
        appendFilterParamsToQueryParts(filterParams),
    );

    return queryParts.join('&');
};

const buildSearchParams = (
    input: string,
): Record<string, string | string[]> => {
    const parts = splitInputQuery(input);
    return parts.reduce(
        (searchAndFilterParams, part) =>
            isFilter(part)
                ? handleFilter(part, searchAndFilterParams)
                : handleSearchTerm(part, searchAndFilterParams),
        {},
    );
};

export const translateToQueryParams = (searchString: string): string => {
    const searchParams = buildSearchParams(searchString);
    return convertToQueryString(searchParams);
};
