import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
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

export const LinkCell: FC<ILinkCellProps> = ({
    title,
    to,
    onClick,
    subtitle,
    children,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const content = (
        <StyledContainer>
            <StyledTitle
                data-loading
                style={{
                    WebkitLineClamp: Boolean(subtitle) ? 1 : 2,
                    lineClamp: Boolean(subtitle) ? 1 : 2,
                }}
            >
                <Highlighter search={searchQuery}>{title}</Highlighter>
                {children}
            </StyledTitle>
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={
                    <>
                        <StyledDescription data-loading>
                            <Highlighter search={searchQuery}>
                                {subtitle}
                            </Highlighter>
                        </StyledDescription>
                    </>
                }
            />
        </StyledContainer>
    );

    return to ? (
        <StyledLink component={RouterLink} to={to} underline="hover">
            {content}
        </StyledLink>
    ) : onClick ? (
        <StyledLink onClick={onClick} underline="hover">
            {content}
        </StyledLink>
    ) : (
        <StyledWrapper>{content}</StyledWrapper>
    );
};
