import type React from 'react';
import type { FC } from 'react';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Truncator } from 'component/common/Truncator/Truncator';

interface IHighlightCellProps {
    value: string;
    subtitle?: string;
    afterTitle?: React.ReactNode;
    subtitleTooltip?: boolean;
    maxTitleLines?: number;
}

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    wordBreak: 'break-word',
    padding: theme.spacing(1, 2),
}));

const StyledTitle = styled('span')(() => ({}));

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
    maxTitleLines,
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
            <Truncator
                lines={maxTitleLines ?? (subtitle ? 1 : 2)}
                title={value}
                arrow
                data-loading
            >
                <StyledTitle>
                    <Highlighter search={searchQuery}>{value}</Highlighter>
                    {afterTitle}
                </StyledTitle>
            </Truncator>
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={renderSubtitle}
            />
        </StyledContainer>
    );
};
