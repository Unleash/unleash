export const caseInsensitiveSearch = (search: string, value?: string) =>
    Boolean(value?.toLowerCase()?.includes(search.toLowerCase()));
