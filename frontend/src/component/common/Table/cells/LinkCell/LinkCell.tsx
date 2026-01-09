import type React from "react";
import { Link as RouterLink } from "react-router-dom";
import { ConditionallyRender } from "component/common/ConditionallyRender/ConditionallyRender";
import { Highlighter } from "component/common/Highlighter/Highlighter";
import { useSearchHighlightContext } from "component/common/Table/SearchHighlightContext/SearchHighlightContext";
import { HtmlTooltip } from "component/common/HtmlTooltip/HtmlTooltip";
import { Truncator } from "component/common/Truncator/Truncator";
import {
    StyledWrapper,
    StyledLink,
    StyledContainer,
    StyledDescription,
} from "./LinkCell.styles";

interface ILinkCellProps {
    title?: string;
    disableTooltip?: boolean;
    to?: string;
    onClick?: () => void;
    subtitle?: string;
    children?: React.ReactNode;
}

export const LinkCell: React.FC<ILinkCellProps> = ({
    title,
    disableTooltip,
    to,
    onClick,
    subtitle,
    children,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const subtitleContent = (
        <StyledDescription data-loading>
            <Highlighter search={searchQuery}>{subtitle}</Highlighter>
        </StyledDescription>
    );

    const renderSubtitle = (
        <ConditionallyRender
            condition={Boolean(subtitle && subtitle.length > 40)}
            show={
                !disableTooltip ? (
                    <HtmlTooltip
                        title={subtitle}
                        placement="bottom-start"
                        arrow
                    >
                        {subtitleContent}
                    </HtmlTooltip>
                ) : (
                    subtitleContent
                )
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
            <Truncator
                lines={subtitle ? 1 : 2}
                title={title}
                arrow
                data-loading
            >
                <span>
                    <Highlighter search={searchQuery}>{title}</Highlighter>
                    {children}
                </span>
            </Truncator>
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={renderSubtitle}
            />
        </StyledContainer>
    );

    if (to) {
        return (
            <StyledLink component={RouterLink} to={to} underline="hover">
                {content}
            </StyledLink>
        );
    }

    if (onClick) {
        return (
            <StyledLink onClick={onClick} underline="hover">
                {content}
            </StyledLink>
        );
    }

    return <StyledWrapper>{content}</StyledWrapper>;
};
