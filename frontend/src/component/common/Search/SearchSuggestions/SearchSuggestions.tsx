import { FilterList } from '@mui/icons-material';
import { Box, Divider, Paper, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    getColumnValues,
    getFilterableColumns,
    getFilterValues,
    IGetSearchContextOutput,
} from 'hooks/useSearch';
import { useMemo, VFC } from 'react';
import { SearchDescription } from './SearchDescription/SearchDescription';
import { SearchInstructions } from './SearchInstructions/SearchInstructions';

const randomIndex = (arr: any[]) => Math.floor(Math.random() * arr.length);

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

const StyledFilterList = styled(FilterList)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    border: `1px dashed ${theme.palette.dividerAlternative}`,
    margin: theme.spacing(1.5, 0),
}));

const StyledCode = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.secondaryContainer,
    color: theme.palette.text.primary,
    padding: theme.spacing(0, 0.5),
    borderRadius: theme.spacing(0.5),
}));

interface SearchSuggestionsProps {
    getSearchContext: () => IGetSearchContextOutput;
}

export const SearchSuggestions: VFC<SearchSuggestionsProps> = ({
    getSearchContext,
}) => {
    const searchContext = getSearchContext();

    const randomRow = useMemo(
        () => randomIndex(searchContext.data),
        [searchContext.data]
    );

    const filters = getFilterableColumns(searchContext.columns)
        .map(column => {
            const filterOptions = searchContext.data.map(row =>
                getColumnValues(column, row)
            );

            return {
                name: column.filterName,
                header: column.Header ?? column.filterName,
                options: [...new Set(filterOptions)].sort((a, b) =>
                    a.localeCompare(b)
                ),
                suggestedOption:
                    filterOptions[randomRow] ?? `example-${column.filterName}`,
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
            ? getColumnValues(
                  searchableColumns[0],
                  searchContext.data[randomRow]
              )
            : 'example-search-text';

    return (
        <StyledPaper>
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
                                getSearchContext={getSearchContext}
                                searchableColumnsString={
                                    searchableColumnsString
                                }
                            />
                        }
                    />
                </Box>
            </StyledBox>
            <StyledDivider />
            <ConditionallyRender
                condition={filters.length > 0}
                show="Combine filters and search."
            />
            <p>
                Example:{' '}
                <StyledCode>
                    {filters.map(filter => (
                        <span key={filter.name}>
                            {filter.name}:{filter.suggestedOption}{' '}
                        </span>
                    ))}
                    <span>{suggestedTextSearch}</span>
                </StyledCode>
            </p>
        </StyledPaper>
    );
};
