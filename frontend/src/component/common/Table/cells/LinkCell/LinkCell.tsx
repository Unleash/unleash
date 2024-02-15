import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import {
    StyledWrapper,
    StyledLink,
    StyledContainer,
    StyledTitle,
    StyledDescription,
} from './LinkCell.styles';

interface ILinkCellProps {
    title?: string;
    to?: string;
    onClick?: () => void;
    subtitle?: string;
}

export const LinkCell: React.FC<ILinkCellProps> = ({
    title,
    to,
    onClick,
    subtitle,
    children,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const renderSubtitle = (
        <ConditionallyRender
            condition={Boolean(subtitle && subtitle.length > 40)}
            show={
                <HtmlTooltip title={subtitle} placement='bottom-start' arrow>
                    <StyledDescription data-loading>
                        <Highlighter search={searchQuery}>
                            {subtitle}
                        </Highlighter>
                    </StyledDescription>
                </HtmlTooltip>
            }
            elseShow={
                <StyledDescription data-loading>
                    <Highlighter search={searchQuery}>{subtitle}</Highlighter>
                </StyledDescription>
            }
        />
    );

    const content = (
        <StyledContainer>
            <StyledTitle
                data-loading
                style={{
                    WebkitLineClamp: subtitle ? 1 : 2,
                    lineClamp: subtitle ? 1 : 2,
                }}
            >
                <Highlighter search={searchQuery}>{title}</Highlighter>
                {children}
            </StyledTitle>
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={renderSubtitle}
            />
        </StyledContainer>
    );

    if (to) {
        return (
            <StyledLink component={RouterLink} to={to} underline='hover'>
                {content}
            </StyledLink>
        );
    }

    if (onClick) {
        return (
            <StyledLink onClick={onClick} underline='hover'>
                {content}
            </StyledLink>
        );
    }

    return <StyledWrapper>{content}</StyledWrapper>;
};
