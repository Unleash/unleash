import {
    isValidFilter,
    getSearchTextGenerator,
    searchInFilteredData,
    filter,
} from './useSearch';

const columns = [
    {
        accessor: 'name',
        searchable: true,
    },
    {
        accessor: (row: any) => row.project,
        filterName: 'project',
        searchable: true,
    },
    {
        accessor: 'stale',
        filterName: 'state',
        filterBy: (row: any, values: string[]) =>
            (values.includes('active') && !row.stale) ||
            (values.includes('stale') && row.stale),
    },
    {
        accessor: (row: any) => row.type,
        searchable: true,
    },
    {
        accessor: 'seen',
        searchable: true,
        searchBy: (row: any, value: string) =>
            (value === 'seen' && row.seen) || (value === 'never' && !row.seen),
    },
];

const data = [
    {
        name: 'my-feature-toggle',
        project: 'default',
        stale: false,
        type: 'release',
        seen: true,
    },
    {
        name: 'my-feature-toggle-2',
        project: 'default',
        stale: true,
        type: 'experiment',
        seen: false,
    },
    {
        name: 'my-feature-toggle-3',
        project: 'my-project',
        stale: false,
        type: 'operational',
        seen: false,
    },
    {
        name: 'my-feature-toggle-4',
        project: 'my-project',
        stale: true,
        type: 'permission',
        seen: true,
    },
];

describe('isValidFilter', () => {
    it('should accept a filter with a value', () => {
        const input = 'project:default';
        const match = 'project';

        const result = isValidFilter(input, match);

        expect(result).toBe(true);
    });

    it('should not accept a filter without a value', () => {
        const input = 'project:';
        const match = 'project';

        const result = isValidFilter(input, match);

        expect(result).toBe(false);
    });

    it('should return false when match is not included in search string', () => {
        const input = 'project:default';
        const match = 'state';

        const result = isValidFilter(input, match);

        expect(result).toBe(false);
    });
});

describe('getSearchText', () => {
    const getSearchText = getSearchTextGenerator(columns);

    it('should return search value without filters', () => {
        const tests = [
            { input: 'project:textsearch default', expectation: 'default' },
            {
                input: 'project:default state:active feature-toggle',
                expectation: 'feature-toggle',
            },
            { input: 'project:default', expectation: '' },
            { input: '', expectation: '' },
            { input: 'a', expectation: 'a' },
            { input: 'a:', expectation: 'a:' },
            { input: 'my-feature:test', expectation: 'my-feature:test' },
            {
                input: 'my-new-feature-toggle project:defaultstate:active',
                expectation: 'my-new-feature-toggle',
            },
            {
                input: 'my-new-feature-toggle project:default state:active',
                expectation: 'my-new-feature-toggle',
            },
        ];

        tests.forEach(test => {
            const result = getSearchText(test.input);
            expect(result).toBe(test.expectation);
        });
    });

    it('should return search value without multiple filters', () => {
        const input = 'project:default state:active feature-toggle';
        const result = getSearchText(input);

        expect(result).toBe('feature-toggle');
    });
});

describe('searchInFilteredData', () => {
    it('should search in searchable columns', () => {
        const tests = [
            {
                input: 'project',
                expectation: [
                    {
                        name: 'my-feature-toggle-3',
                        project: 'my-project',
                        stale: false,
                        type: 'operational',
                        seen: false,
                    },
                    {
                        name: 'my-feature-toggle-4',
                        project: 'my-project',
                        stale: true,
                        type: 'permission',
                        seen: true,
                    },
                ],
            },
            {
                input: 'toggle-2',
                expectation: [
                    {
                        name: 'my-feature-toggle-2',
                        project: 'default',
                        stale: true,
                        type: 'experiment',
                        seen: false,
                    },
                ],
            },
            {
                input: 'non-existing-toggle',
                expectation: [],
            },
        ];

        tests.forEach(test => {
            const result = searchInFilteredData(columns, test.input, data);
            expect(result).toEqual(test.expectation);
        });
    });

    it('should use column accessor function to search when defined', () => {
        const result = searchInFilteredData(columns, 'experiment', data);

        expect(result).toEqual([
            {
                name: 'my-feature-toggle-2',
                project: 'default',
                stale: true,
                type: 'experiment',
                seen: false,
            },
        ]);
    });

    it('should use custom search function to search when defined', () => {
        const result = searchInFilteredData(columns, 'never', data);

        expect(result).toEqual([
            {
                name: 'my-feature-toggle-2',
                project: 'default',
                stale: true,
                type: 'experiment',
                seen: false,
            },
            {
                name: 'my-feature-toggle-3',
                project: 'my-project',
                stale: false,
                type: 'operational',
                seen: false,
            },
        ]);
    });
});

describe('filter', () => {
    it('should filter in filterable columns', () => {
        const tests = [
            {
                input: 'project:default',
                expectation: [
                    {
                        name: 'my-feature-toggle',
                        project: 'default',
                        stale: false,
                        type: 'release',
                        seen: true,
                    },
                    {
                        name: 'my-feature-toggle-2',
                        project: 'default',
                        stale: true,
                        type: 'experiment',
                        seen: false,
                    },
                ],
            },
            {
                input: 'state:active',
                expectation: [
                    {
                        name: 'my-feature-toggle',
                        project: 'default',
                        stale: false,
                        type: 'release',
                        seen: true,
                    },
                    {
                        name: 'my-feature-toggle-3',
                        project: 'my-project',
                        stale: false,
                        type: 'operational',
                        seen: false,
                    },
                ],
            },
            {
                input: 'state:something-else',
                expectation: [],
            },
        ];

        tests.forEach(test => {
            const result = filter(columns, test.input, data);
            expect(result).toEqual(test.expectation);
        });
    });

    it('should use column accessor function to filter when defined', () => {
        const result = filter(columns, 'project:my-project', data);

        expect(result).toEqual([
            {
                name: 'my-feature-toggle-3',
                project: 'my-project',
                stale: false,
                type: 'operational',
                seen: false,
            },
            {
                name: 'my-feature-toggle-4',
                project: 'my-project',
                stale: true,
                type: 'permission',
                seen: true,
            },
        ]);
    });

    it('should use custom filter function to filter when defined', () => {
        const result = filter(columns, 'state:stale', data);

        expect(result).toEqual([
            {
                name: 'my-feature-toggle-2',
                project: 'default',
                stale: true,
                type: 'experiment',
                seen: false,
            },
            {
                name: 'my-feature-toggle-4',
                project: 'my-project',
                stale: true,
                type: 'permission',
                seen: true,
            },
        ]);
    });
});
