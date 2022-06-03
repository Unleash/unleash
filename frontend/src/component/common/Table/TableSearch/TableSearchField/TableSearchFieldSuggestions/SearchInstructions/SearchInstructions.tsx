import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IGetSearchContextOutput } from 'hooks/useSearch';
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

interface ISearchInstructionsProps {
    filters: any[];
    getSearchContext: () => IGetSearchContextOutput;
    searchableColumnsString: string;
}

export const SearchInstructions: VFC<ISearchInstructionsProps> = ({
    filters,
    getSearchContext,
    searchableColumnsString,
}) => {
    return (
        <>
            <StyledHeader>
                {filters.length > 0
                    ? 'Filter your search with operators like:'
                    : `Start typing to search${
                          searchableColumnsString
                              ? ` in ${searchableColumnsString}`
                              : '...'
                      }`}
            </StyledHeader>
            {filters.map(filter => (
                <p key={filter.name}>
                    Filter by {filter.header}:{' '}
                    <StyledCode>
                        {filter.name}:{filter.options[0]}
                    </StyledCode>
                    <ConditionallyRender
                        condition={filter.options.length > 1}
                        show={
                            <>
                                {' or '}
                                <StyledCode>
                                    {filter.name}:
                                    {filter.options.slice(0, 2).join(',')}
                                </StyledCode>
                            </>
                        }
                    />
                </p>
            ))}
        </>
    );
};
