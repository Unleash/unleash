import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VFC } from 'react';

const StyledHeader = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
}));

const StyledCode = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.2, 1),
    borderRadius: theme.spacing(0.5),
}));

const StyledFilterHint = styled('p')(({ theme }) => ({
    // marginTop: theme.spacing(0.5),
    lineHeight: 1.75,
}));

interface ISearchInstructionsProps {
    filters: any[];
    searchableColumnsString: string;
}

export const SearchInstructions: VFC<ISearchInstructionsProps> = ({
    filters,
    searchableColumnsString,
}) => {
    return (
        <>
            <StyledHeader>
                {filters.length > 0
                    ? 'Filter your results by:'
                    : `Start typing to search${
                          searchableColumnsString
                              ? ` in ${searchableColumnsString}`
                              : '...'
                      }`}
            </StyledHeader>
            {filters.map(filter => (
                <StyledFilterHint key={filter.name}>
                    {filter.header}:{' '}
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
                </StyledFilterHint>
            ))}
        </>
    );
};
