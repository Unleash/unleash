/**
 * For `react-table`.
 *
 * @see https://react-table.tanstack.com/docs/api/useSortBy#table-options
 */
export const sortTypes = {
    date: (v1: any, v2: any, id: string) => {
        const a = new Date(v1?.values?.[id] || 0);
        const b = new Date(v2?.values?.[id] || 0);
        return b?.getTime() - a?.getTime(); // newest first by default
    },
    boolean: (v1: any, v2: any, id: string) => {
        const a = v1?.values?.[id];
        const b = v2?.values?.[id];
        return a === b ? 0 : a ? 1 : -1;
    },
    alphanumeric: (a: any, b: any, id: string) =>
        (a?.values?.[id] || '')
            ?.toLowerCase()
            .localeCompare(b?.values?.[id]?.toLowerCase() || ''),
    playgroundResultState: (v1: any, v2: any, id: string) => {
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
