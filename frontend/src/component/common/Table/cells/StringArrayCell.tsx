import type { VFC } from 'react';
import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledTag = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IArrayFieldCellProps<T> {
    row: T;
    field: keyof T;
    singularLabel: string;
    pluralLabel?: string;
}

export const StringArrayCell: VFC<IArrayFieldCellProps<any>> = ({
    row,
    field,
    singularLabel,
    pluralLabel,
}) => {
    const { searchQuery } = useSearchHighlightContext();
    const fieldValue = row[field];

    if (!Array.isArray(fieldValue) || fieldValue.length === 0)
        return <TextCell />;

    const labelForMultiple = pluralLabel || `${singularLabel}s`;

    return (
        <TextCell>
            <TooltipLink
                highlighted={
                    searchQuery.length > 0 &&
                    fieldValue.some((item: string | null) =>
                        item?.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                }
                tooltip={
                    <>
                        {fieldValue.map((item: string) => (
                            <StyledTag key={item}>
                                <Highlighter search={searchQuery}>
                                    {item}
                                </Highlighter>
                            </StyledTag>
                        ))}
                    </>
                }
            >
                {fieldValue.length === 1
                    ? `1 ${singularLabel}`
                    : `${fieldValue.length} ${labelForMultiple}`}
            </TooltipLink>
        </TextCell>
    );
};
