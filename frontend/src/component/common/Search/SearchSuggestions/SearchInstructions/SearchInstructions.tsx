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
    cursor: 'pointer',
}));

const StyledFilterHint = styled('p')(({ theme }) => ({
    lineHeight: 1.75,
}));

interface ISearchInstructionsProps {
    filters: any[];
    searchableColumnsString: string;
    onClick: (instruction: string) => void;
}

const firstFilterOption = (filter: { name: string; options: string[] }) =>
    `${filter.name}:${filter.options[0]}`;
const secondFilterOption = (filter: { name: string; options: string[] }) =>
    `${filter.name}:${filter.options.slice(0, 2).join(',')}`;

export const SearchInstructions: VFC<ISearchInstructionsProps> = ({
    filters,
    searchableColumnsString,
    onClick,
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
                    <StyledCode
                        onClick={() => onClick(firstFilterOption(filter))}
                    >
                        {firstFilterOption(filter)}
                    </StyledCode>
                    <ConditionallyRender
                        condition={filter.options.length > 1}
                        show={
                            <>
                                {' or '}
                                <StyledCode
                                    onClick={() => {
                                        onClick(secondFilterOption(filter));
                                    }}
                                >
                                    {secondFilterOption(filter)}
                                </StyledCode>
                            </>
                        }
                    />
                </StyledFilterHint>
            ))}
        </>
    );
};
