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

//@ts-ignore
import removeMd from 'remove-markdown';
import { SimpleMarkdown } from 'component/common/Markdown/Markdown';

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
    const subTitleClean = removeMd(subtitle);
    
    const { searchQuery } = useSearchHighlightContext();

    const renderSubtitle = (
        <ConditionallyRender
            condition={Boolean(subTitleClean && subTitleClean.length > 40)}
            show={
                <HtmlTooltip title={<SimpleMarkdown>{subtitle || ''}</SimpleMarkdown>} placement='bottom-start' arrow>
                    <StyledDescription data-loading>
                        <Highlighter search={searchQuery}>
                            {subTitleClean}
                        </Highlighter>
                    </StyledDescription>
                </HtmlTooltip>
            }
            elseShow={
                <StyledDescription data-loading>
                    <Highlighter search={searchQuery}>{subTitleClean}</Highlighter>
                </StyledDescription>
            }
        />
    );

    const content = (
        <StyledContainer>
            <StyledTitle
                data-loading
                style={{
                    WebkitLineClamp: subTitleClean ? 1 : 2,
                    lineClamp: subTitleClean ? 1 : 2,
                }}
            >
                <Highlighter search={searchQuery}>{title}</Highlighter>
                {children}
            </StyledTitle>
            <ConditionallyRender
                condition={Boolean(subTitleClean)}
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
