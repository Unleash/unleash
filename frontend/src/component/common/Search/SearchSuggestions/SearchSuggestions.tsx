import { FilterList, History } from '@mui/icons-material';
import { Box, Divider, Paper, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    getColumnValues,
    getFilterableColumns,
    getFilterValues,
    IGetSearchContextOutput,
} from 'hooks/useSearch';
import { VFC } from 'react';
import { SearchDescription } from './SearchDescription/SearchDescription';
import {
    SearchInstructions,
    StyledCode,
} from './SearchInstructions/SearchInstructions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '20px',
    zIndex: 2,
    padding: theme.spacing(4, 1.5, 1.5),
    borderBottomLeftRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
    boxShadow: '0px 8px 20px rgba(33, 33, 33, 0.15)',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    wordBreak: 'break-word',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledHistory = styled(History)(({ theme }) => ({
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
        .map(column => {
            const filterOptions = searchContext.data.map(row =>
                getColumnValues(column, row)
            );

            const options = [...new Set(filterOptions)]
                .filter(Boolean)
                .flatMap(item => item.split('\n'))
                .filter(item => !item.includes('"') && !item.includes("'"))
                .map(quote)
                .sort((a, b) => a.localeCompare(b));

            return {
                name: column.filterName,
                header: column.Header ?? column.filterName,
                options,
                suggestedOption: options[0] ?? `example-${column.filterName}`,
                values: getFilterValues(
                    column.filterName,
                    searchContext.searchValue
                ),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const searchableColumns = searchContext.columns.filter(
        column => column.searchable && column.accessor
    );

    const searchableColumnsString = searchableColumns
        .map(column => column.Header ?? column.accessor)
        .join(', ');

    const suggestedTextSearch =
        searchContext.data.length && searchableColumns.length
            ? getColumnValues(searchableColumns[0], searchContext.data[0])
            : 'example-search-text';

    const selectedFilter = filters.map(
        filter => `${filter.name}:${filter.suggestedOption}`
    )[0];

    return (
        <StyledPaper className="dropdown-outline">
            <ConditionallyRender
                condition={Boolean(savedQuery)}
                show={
                    <>
                        <StyledBox>
                            <StyledHistory />
                            <StyledCode
                                onClick={() => {
                                    onSuggestion(savedQuery || '');
                                    trackEvent('search-filter-suggestions', {
                                        props: {
                                            eventType: 'saved query',
                                        },
                                    });
                                }}
                            >
                                <span>{savedQuery}</span>
                            </StyledCode>
                        </StyledBox>
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
                                onClick={suggestion => {
                                    onSuggestion(suggestion);
                                    trackEvent('search-filter-suggestions', {
                                        props: {
                                            eventType: 'filter',
                                        },
                                    });
                                }}
                            />
                        }
                    />
                </Box>
            </StyledBox>
            <StyledDivider />
            <Box sx={{ lineHeight: 1.75 }}>
                <ConditionallyRender
                    condition={filters.length > 0}
                    show="Combine filters and search: "
                />
                <StyledCode
                    onClick={() => {
                        onSuggestion(
                            selectedFilter + ' ' + suggestedTextSearch
                        );
                        trackEvent('search-filter-suggestions', {
                            props: {
                                eventType: 'search and filter',
                            },
                        });
                    }}
                >
                    <span key={selectedFilter}>{selectedFilter}</span>{' '}
                    <span>{suggestedTextSearch}</span>
                </StyledCode>
            </Box>
        </StyledPaper>
    );
};
