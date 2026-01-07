import type { VFC } from 'react';
import type { FeatureSchema, TagSchema } from 'openapi';
import { styled, Typography } from '@mui/material';
import { TextCell } from '../TextCell/TextCell.tsx';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { formatTag } from 'utils/format-tag';

const StyledTag = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IFeatureTagCellProps {
    row: {
        original: FeatureSchema;
    };
}

export const FeatureTagCell: VFC<IFeatureTagCellProps> = ({ row }) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!row.original.tags || row.original.tags.length === 0)
        return <TextCell />;

    const value =
        row.original.tags?.map((tag: TagSchema) => formatTag(tag)).join('\n') ||
        '';

    return (
        <TextCell>
            <TooltipLink
                highlighted={
                    searchQuery.length > 0 &&
                    value?.toLowerCase().includes(searchQuery.toLowerCase())
                }
                tooltip={
                    <>
                        {row.original.tags?.map((tag) => (
                            <StyledTag key={tag.type + tag.value}>
                                <Highlighter search={searchQuery}>
                                    {formatTag(tag)}
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
