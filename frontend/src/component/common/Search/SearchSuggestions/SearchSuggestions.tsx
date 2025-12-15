import FilterList from '@mui/icons-material/FilterList';
import History from '@mui/icons-material/History';
import { Box, Divider, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    getColumnValues,
    getFilterableColumns,
    getFilterValues,
    type IGetSearchContextOutput,
} from 'hooks/useSearch';
import type { VFC } from 'react';
import { SearchDescription } from './SearchDescription/SearchDescription.tsx';
import {
    SearchInstructions,
    StyledCode,
} from './SearchInstructions/SearchInstructions.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { onEnter } from './onEnter.ts';
import { SearchHistory } from './SearchHistory.tsx';
import { SearchPaper } from '../Search.tsx';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const _StyledHistory = styled(History)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledFilterList = styled(FilterList)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    border: `1px dashed ${theme.palette.divider}`,
    margin: theme.spacing(1.5, 0),
}));

interface SearchSuggestionsProps {
    getSearchContext: () => IGetSearchContextOutput;
    onSuggestion: (suggestion: string) => void;
    savedQuery?: string;
}

const quote = (item: string) => (item.includes(' ') ? `"${item}"` : item);

export const SearchSuggestions: VFC<SearchSuggestionsProps> = ({
    getSearchContext,
    onSuggestion,
    savedQuery,
}) => {
    const { trackEvent } = usePlausibleTracker();
    const searchContext = getSearchContext();

    const filters = getFilterableColumns(searchContext.columns)
        .map((column) => {
            const filterOptions = searchContext.data.map((row) =>
                getColumnValues(column, row),
            );

            const options = [...new Set(filterOptions)]
                .filter(Boolean)
                .flatMap((item) => item.split('\n'))
                .filter((item) => !item.includes('"') && !item.includes("'"))
                .map(quote)
                .sort((a, b) => a.localeCompare(b));

            return {
                name: column.filterName,
                header: column.Header ?? column.filterName,
                options,
                suggestedOption: options[0] ?? `example-${column.filterName}`,
                values: getFilterValues(
                    column.filterName,
                    searchContext.searchValue,
                ),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const searchableColumns = searchContext.columns.filter(
        (column) => column.searchable && column.accessor,
    );

    const searchableColumnsString = searchableColumns
        .map((column) => column.Header ?? column.accessor)
        .join(', ');

    const suggestedTextSearch =
        searchContext.data.length && searchableColumns.length
            ? getColumnValues(searchableColumns[0], searchContext.data[0])
            : 'example-search-text';

    const selectedFilter =
        filters.length === 0
            ? ''
            : filters.map(
                  (filter) => `${filter.name}:${filter.suggestedOption}`,
              )[0];

    const onFilter = (suggestion: string) => {
        onSuggestion(suggestion);
        trackEvent('search-filter-suggestions', {
            props: {
                eventType: 'filter',
            },
        });
    };
    const onSearchAndFilter = () => {
        onSuggestion(`${selectedFilter} ${suggestedTextSearch}`.trim());
        trackEvent('search-filter-suggestions', {
            props: {
                eventType: 'search and filter',
            },
        });
    };

    return (
        <SearchPaper className='dropdown-outline'>
            <ConditionallyRender
                condition={Boolean(savedQuery)}
                show={
                    <>
                        <SearchHistory
                            onSuggestion={onSuggestion}
                            savedQuery={savedQuery}
                        />
                        <StyledDivider />
                    </>
                }
            />
            <StyledBox>
                <StyledFilterList />
                <Box>
                    <ConditionallyRender
                        condition={Boolean(searchContext.searchValue)}
                        show={
                            <SearchDescription
                                filters={filters}
                                getSearchContext={getSearchContext}
                                searchableColumnsString={
                                    searchableColumnsString
                                }
                            />
                        }
                        elseShow={
                            <SearchInstructions
                                filters={filters}
                                searchableColumnsString={
                                    searchableColumnsString
                                }
                                onClick={onFilter}
                            />
                        }
                    />
                </Box>
            </StyledBox>
            <StyledDivider />
            <Box sx={{ lineHeight: 1.75 }}>
                <ConditionallyRender
                    condition={filters.length > 0}
                    show='Combine filters and search: '
                />
                <StyledCode
                    tabIndex={0}
                    onClick={onSearchAndFilter}
                    onKeyDown={onEnter(onSearchAndFilter)}
                >
                    <span key={selectedFilter}>{selectedFilter}</span>{' '}
                    <span>{suggestedTextSearch}</span>
                </StyledCode>
            </Box>
        </SearchPaper>
    );
};
