import { ReactNode } from 'react';
import { Link, LinkProps, styled } from '@mui/material';
import { HtmlTooltip, IHtmlTooltipProps } from '../HtmlTooltip/HtmlTooltip';

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
    color: theme.palette.text.primary,
    textDecorationColor: theme.palette.text.disabled,
    textDecorationStyle: 'dashed',
    textUnderlineOffset: theme.spacing(0.5),
}));

interface ITooltipLinkProps extends LinkProps {
    tooltip: ReactNode;
    highlighted?: boolean;
    tooltipProps?: Omit<IHtmlTooltipProps, 'title' | 'children'>;
    children: ReactNode;
}

export const TooltipLink = ({
    tooltip,
    highlighted,
    tooltipProps,
    children,
    ...props
}: ITooltipLinkProps) => (
    <HtmlTooltip title={tooltip} {...tooltipProps} arrow>
        <StyledLink tabIndex={0} highlighted={highlighted} {...props}>
            {children}
        </StyledLink>
    </HtmlTooltip>
);
