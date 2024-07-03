import type React from 'react';
import type { FC } from 'react';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

interface IHighlightCellProps {
    value: string;
    subtitle?: string;
    afterTitle?: React.ReactNode;
    subtitleTooltip?: boolean;
}

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    wordBreak: 'break-word',
    padding: theme.spacing(1, 2),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    lineClamp: '1',
}));

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 'inherit',
    WebkitLineClamp: '1',
    lineClamp: '1',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
}));

export const HighlightCell: FC<IHighlightCellProps> = ({
    value,
    subtitle,
    afterTitle,
    subtitleTooltip,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const renderSubtitle = (
        <ConditionallyRender
            condition={Boolean(
                subtitle && (subtitle.length > 40 || subtitleTooltip),
            )}
            show={
                <HtmlTooltip title={subtitle} placement='bottom-start' arrow>
                    <StyledSubtitle data-loading>
                        <Highlighter search={searchQuery}>
                            {subtitle}
                        </Highlighter>
                    </StyledSubtitle>
                </HtmlTooltip>
            }
            elseShow={
                <StyledSubtitle data-loading>
                    <Highlighter search={searchQuery}>{subtitle}</Highlighter>
                </StyledSubtitle>
            }
        />
    );

    return (
        <StyledContainer>
            <StyledTitle
                style={{
                    WebkitLineClamp: subtitle ? 1 : 2,
                    lineClamp: subtitle ? 1 : 2,
                }}
                data-loading
            >
                <Highlighter search={searchQuery}>{value}</Highlighter>
                {afterTitle}
            </StyledTitle>
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={renderSubtitle}
            />
        </StyledContainer>
    );
};
