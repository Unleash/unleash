import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { VFC } from 'react';
import { onEnter } from '../onEnter.ts';

const StyledHeader = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
}));

export const StyledCode = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.2, 1),
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover, &:focus-visible': {
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.seen.primary,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
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
            {filters.map((filter) => (
                <StyledFilterHint key={filter.name}>
                    {filter.header}:{' '}
                    <ConditionallyRender
                        condition={filter.options.length > 0}
                        show={
                            <StyledCode
                                tabIndex={0}
                                onKeyDown={onEnter(() =>
                                    onClick(firstFilterOption(filter)),
                                )}
                                onClick={() =>
                                    onClick(firstFilterOption(filter))
                                }
                            >
                                {firstFilterOption(filter)}
                            </StyledCode>
                        }
                    />
                    <ConditionallyRender
                        condition={filter.options.length > 1}
                        show={
                            <>
                                {' or '}
                                <StyledCode
                                    tabIndex={0}
                                    onKeyDown={onEnter(() =>
                                        onClick(secondFilterOption(filter)),
                                    )}
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
