import { VFC } from 'react';
import { FeatureSchema } from 'openapi';
import { styled, Typography } from '@mui/material';
import { TextCell } from '../TextCell/TextCell';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledTag = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IFeatureTagCellProps {
    row: {
        original: FeatureSchema;
    };
    value: string;
}

export const FeatureTagCell: VFC<IFeatureTagCellProps> = ({ row, value }) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!row.original.tags || row.original.tags.length === 0)
        return <TextCell />;

    return (
        <TextCell>
            <TooltipLink
                highlighted={
                    searchQuery.length > 0 &&
                    value.toLowerCase().includes(searchQuery.toLowerCase())
                }
                tooltip={
                    <>
                        {row.original.tags?.map(tag => (
                            <StyledTag key={tag.type + tag.value}>
                                <Highlighter search={searchQuery}>
                                    {`${tag.type}:${tag.value}`}
                                </Highlighter>
                            </StyledTag>
                        ))}
                    </>
                }
            >
                {row.original.tags?.length === 1
                    ? '1 tag'
                    : `${row.original.tags?.length} tags`}
            </TooltipLink>
        </TextCell>
    );
};
