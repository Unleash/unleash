export const PAGINATION_OPTIONS = [25, 50, 75, 100] as const;

export type PaginationOption = (typeof PAGINATION_OPTIONS)[number];

export const DEFAULT_PAGE_LIMIT = 25;

export const isValidPaginationOption = (
    value: unknown,
): value is PaginationOption => {
    return (
        typeof value === 'number' &&
        PAGINATION_OPTIONS.includes(value as PaginationOption)
    );
};
