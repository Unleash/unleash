import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    getSearchTextGenerator,
    IGetSearchContextOutput,
} from 'hooks/useSearch';
import { VFC } from 'react';

const StyledHeader = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
}));

const StyledCode = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.secondaryContainer,
    color: theme.palette.text.primary,
    padding: theme.spacing(0, 0.5),
    borderRadius: theme.spacing(0.5),
}));

interface ISearchDescriptionProps {
    filters: any[];
    getSearchContext: () => IGetSearchContextOutput;
    searchableColumnsString: string;
}

export const SearchDescription: VFC<ISearchDescriptionProps> = ({
    filters,
    getSearchContext,
    searchableColumnsString,
}) => {
    const searchContext = getSearchContext();
    const getSearchText = getSearchTextGenerator(searchContext.columns);
    const searchText = getSearchText(searchContext.searchValue);
    const searchFilters = filters.filter(filter => filter.values.length > 0);

    return (
        <>
            <ConditionallyRender
                condition={Boolean(searchText)}
                show={
                    <>
                        <StyledHeader>Searching for:</StyledHeader>
                        <p>
                            <StyledCode>{searchText}</StyledCode>{' '}
                            {searchableColumnsString
                                ? ` in ${searchableColumnsString}`
                                : ''}
                        </p>
                    </>
                }
            />
            <ConditionallyRender
                condition={searchFilters.length > 0}
                show={
                    <>
                        <StyledHeader>Filtering by:</StyledHeader>
                        {searchFilters.map(filter => (
                            <p key={filter.name}>
                                <StyledCode>
                                    {filter.values.join(',')}
                                </StyledCode>{' '}
                                in {filter.header}. Options:{' '}
                                {filter.options.join(', ')}
                            </p>
                        ))}
                    </>
                }
            />
        </>
    );
};
