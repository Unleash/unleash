import {
    isValidFilter,
    getSearchTextGenerator,
    searchInFilteredData,
    filter,
    useSearch,
    includesFilter,
    getColumnValues,
} from './useSearch.ts';
import type { FC } from 'react';
import { render, screen } from '@testing-library/react';
import type { IFeatureFlagListItem } from '../interfaces/featureToggle.ts';

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
    {
        accessor: (row: IFeatureFlagListItem) =>
            row.tags?.map(({ type, value }) => `${type}:${value}`).join('\n') ||
            '',
        searchable: true,
        filterName: 'tags',
        filterBy(row: IFeatureFlagListItem, values: string[]) {
            return includesFilter(getColumnValues(this, row), values);
        },
    },
];

const data = [
    {
        name: 'my-feature-flag',
        project: 'default',
        stale: false,
        type: 'release',
        seen: true,
        tags: [
            { type: 'simple', value: 'tag' },
            { type: 'simple', value: 'some space' },
        ],
    },
    {
        name: 'my-feature-flag-2',
        project: 'default',
        stale: true,
        type: 'experiment',
        seen: false,
        tags: [],
    },
    {
        name: 'my-feature-flag-3',
        project: 'my-project',
        stale: false,
        type: 'operational',
        seen: false,
        tags: [],
    },
    {
        name: 'my-feature-flag-4',
        project: 'my-project',
        stale: true,
        type: 'permission',
        seen: true,
        tags: [],
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
                input: 'project:default state:active feature-flag',
                expectation: 'feature-flag',
            },
            { input: 'project:default', expectation: '' },
            { input: '', expectation: '' },
            { input: 'a', expectation: 'a' },
            { input: 'a:', expectation: 'a:' },
            { input: 'my-feature:test', expectation: 'my-feature:test' },
            {
                input: 'my-new-feature-flag project:defaultstate:active',
                expectation: 'my-new-feature-flag',
            },
            {
                input: 'my-new-feature-flag project:default state:active',
                expectation: 'my-new-feature-flag',
            },
        ];

        tests.forEach((test) => {
            const result = getSearchText(test.input);
            expect(result).toBe(test.expectation);
        });
    });

    it('should return search value without multiple filters', () => {
        const input = 'project:default state:active feature-flag';
        const result = getSearchText(input);

        expect(result).toBe('feature-flag');
    });
});

describe('searchInFilteredData', () => {
    it('should search in searchable columns', () => {
        const tests = [
            {
                input: 'project',
                expectation: [
                    {
                        name: 'my-feature-flag-3',
                        project: 'my-project',
                        stale: false,
                        tags: [],
                        type: 'operational',
                        seen: false,
                    },
                    {
                        name: 'my-feature-flag-4',
                        project: 'my-project',
                        stale: true,
                        tags: [],
                        type: 'permission',
                        seen: true,
                    },
                ],
            },
            {
                input: 'flag-2',
                expectation: [
                    {
                        name: 'my-feature-flag-2',
                        project: 'default',
                        stale: true,
                        tags: [],
                        type: 'experiment',
                        seen: false,
                    },
                ],
            },
            {
                input: 'non-existing-flag',
                expectation: [],
            },
        ];

        tests.forEach((test) => {
            const result = searchInFilteredData(columns, test.input, data);
            expect(result).toEqual(test.expectation);
        });
    });

    it('should use column accessor function to search when defined', () => {
        const result = searchInFilteredData(columns, 'experiment', data);

        expect(result).toEqual([
            {
                name: 'my-feature-flag-2',
                project: 'default',
                stale: true,
                tags: [],
                type: 'experiment',
                seen: false,
            },
        ]);
    });

    it('should use custom search function to search when defined', () => {
        const result = searchInFilteredData(columns, 'never', data);

        expect(result).toEqual([
            {
                name: 'my-feature-flag-2',
                project: 'default',
                stale: true,
                tags: [],
                type: 'experiment',
                seen: false,
            },
            {
                name: 'my-feature-flag-3',
                project: 'my-project',
                stale: false,
                tags: [],
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
                        name: 'my-feature-flag',
                        project: 'default',
                        stale: false,
                        tags: [
                            { type: 'simple', value: 'tag' },
                            { type: 'simple', value: 'some space' },
                        ],
                        type: 'release',
                        seen: true,
                    },
                    {
                        name: 'my-feature-flag-2',
                        project: 'default',
                        stale: true,
                        tags: [],
                        type: 'experiment',
                        seen: false,
                    },
                ],
            },
            {
                input: 'state:active',
                expectation: [
                    {
                        name: 'my-feature-flag',
                        project: 'default',
                        stale: false,
                        tags: [
                            { type: 'simple', value: 'tag' },
                            { type: 'simple', value: 'some space' },
                        ],
                        type: 'release',
                        seen: true,
                    },
                    {
                        name: 'my-feature-flag-3',
                        project: 'my-project',
                        stale: false,
                        tags: [],
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

        tests.forEach((test) => {
            const result = filter(columns, test.input, data);
            expect(result).toEqual(test.expectation);
        });
    });

    it('should use column accessor function to filter when defined', () => {
        const result = filter(columns, 'project:my-project', data);

        expect(result).toEqual([
            {
                name: 'my-feature-flag-3',
                project: 'my-project',
                stale: false,
                tags: [],
                type: 'operational',
                seen: false,
            },
            {
                name: 'my-feature-flag-4',
                project: 'my-project',
                stale: true,
                tags: [],
                type: 'permission',
                seen: true,
            },
        ]);
    });

    it('should use custom filter function to filter when defined', () => {
        const result = filter(columns, 'state:stale', data);

        expect(result).toEqual([
            {
                name: 'my-feature-flag-2',
                project: 'default',
                stale: true,
                tags: [],
                type: 'experiment',
                seen: false,
            },
            {
                name: 'my-feature-flag-4',
                project: 'my-project',
                stale: true,
                tags: [],
                type: 'permission',
                seen: true,
            },
        ]);
    });
});

const SearchData: FC<{ searchValue: string }> = ({ searchValue }) => {
    const search = useSearch(columns, searchValue, data);

    return <div>{search.data.map((item) => item.name).join(',')}</div>;
};

const SearchText: FC<{ searchValue: string }> = ({ searchValue }) => {
    const search = useSearch(columns, searchValue, data);

    return <div>{search.getSearchText(searchValue)}</div>;
};

describe('Search and filter data', () => {
    it('should filter single value', () => {
        render(<SearchData searchValue={'project:my-project'} />);

        screen.getByText('my-feature-flag-3,my-feature-flag-4');
    });

    it('should filter multiple values', () => {
        render(<SearchData searchValue={'project:my-project,another-value'} />);

        screen.getByText('my-feature-flag-3,my-feature-flag-4');
    });

    it('should filter multiple values with spaces', () => {
        render(
            <SearchData searchValue={'project:my-project  ,  another-value'} />,
        );

        screen.getByText('my-feature-flag-3,my-feature-flag-4');
    });

    it('should handle multiple filters', () => {
        render(
            <SearchData
                searchValue={'project:my-project ,another-value state:active'}
            />,
        );

        screen.getByText('my-feature-flag-3');
    });

    it('should handle multiple filters with long spaces', () => {
        render(
            <SearchData
                searchValue={
                    'project:my-project   ,   another-value   state:active   ,   stale'
                }
            />,
        );

        screen.getByText('my-feature-flag-3,my-feature-flag-4');
    });

    it('should handle multiple filters and search string in between', () => {
        render(
            <SearchData
                searchValue={
                    'project:my-project , another-value flag-3 state:active , stale'
                }
            />,
        );

        screen.getByText('my-feature-flag-3');
    });

    it('should handle multiple filters and search string at the end', () => {
        render(
            <SearchData
                searchValue={
                    'project:my-project , another-value state:active , stale flag-3'
                }
            />,
        );

        screen.getByText('my-feature-flag-3');
    });

    it('should handle multiple filters and search string at the beginning', () => {
        render(
            <SearchData
                searchValue={
                    'flag-3 project:my-project , another-value state:active , stale'
                }
            />,
        );

        screen.getByText('my-feature-flag-3');
    });

    it('should return basic search text', () => {
        render(<SearchText searchValue={'flag-3'} />);

        screen.getByText('flag-3');
    });

    it('should return advanced search text', () => {
        render(
            <SearchText
                searchValue={
                    'project:my-project , another-value flag-3 state:active , stale'
                }
            />,
        );

        screen.getByText('flag-3');
    });

    it('should support custom filter and accessor', () => {
        render(<SearchData searchValue={'tags:simple:tag'} />);

        screen.getByText('my-feature-flag');
    });

    it('should support search on top of filter', () => {
        render(<SearchText searchValue={'tags:simple:tag simple:tag'} />);

        screen.getByText('simple:tag');
    });

    it('should support custom filter with spaces', () => {
        render(<SearchData searchValue={'tags:"simple:some space",tag'} />);

        screen.getByText('my-feature-flag');
    });

    it('should support custom filter with spaces - space in second term', () => {
        render(<SearchData searchValue={'tags:tag,"simple:some space"'} />);

        screen.getByText('my-feature-flag');
    });

    it('should support quotes in filter and search', () => {
        render(
            <SearchData
                searchValue={'tags:tag,"simple:some space" "my-feature-flag"'}
            />,
        );

        screen.getByText('my-feature-flag');
    });
});
