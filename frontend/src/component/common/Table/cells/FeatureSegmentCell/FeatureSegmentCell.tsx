import type { VFC } from 'react';
import type { FeatureSearchResponseSchema } from 'openapi';
import { styled, Typography } from '@mui/material';
import { TextCell } from '../TextCell/TextCell.tsx';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledTag = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IFeatureSegmentCellProps {
    row: {
        original: FeatureSearchResponseSchema;
    };
    value: string;
}

export const FeatureSegmentCell: VFC<IFeatureSegmentCellProps> = ({
    row,
    value,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!row.original.segments || row.original.segments.length === 0)
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
                        {row.original.segments?.map((segment) => (
                            <StyledTag key={segment}>
                                <Highlighter search={searchQuery}>
                                    {segment}
                                </Highlighter>
                            </StyledTag>
                        ))}
                    </>
                }
            >
                {row.original.segments?.length === 1
                    ? '1 segment'
                    : `${row.original.segments?.length} segments`}
            </TooltipLink>
        </TextCell>
    );
};
