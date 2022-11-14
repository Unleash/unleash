import { VFC } from 'react';
import { FeatureSchema } from 'openapi';
import { Link, styled, Typography } from '@mui/material';
import { TextCell } from '../TextCell/TextCell';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

const StyledTag = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
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
            <HtmlTooltip
                title={
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
                <StyledLink
                    underline="always"
                    highlighted={
                        searchQuery.length > 0 && value.includes(searchQuery)
                    }
                >
                    {row.original.tags?.length === 1
                        ? '1 tag'
                        : `${row.original.tags?.length} tags`}
                </StyledLink>
            </HtmlTooltip>
        </TextCell>
    );
};
