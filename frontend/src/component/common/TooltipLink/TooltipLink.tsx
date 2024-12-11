import type { ReactNode } from 'react';
import { Link, type LinkProps, styled } from '@mui/material';
import {
    HtmlTooltip,
    type IHtmlTooltipProps,
} from '../HtmlTooltip/HtmlTooltip';

const StyledLink = styled(Link, {
    shouldForwardProp: (prop) => prop !== 'highlighted' && prop !== 'clampText',
})<{ highlighted?: boolean; clampText?: boolean }>(
    ({ theme, highlighted, clampText }) => ({
        backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
        color: theme.palette.text.primary,
        textDecorationColor: theme.palette.text.disabled,
        textDecorationStyle: 'dashed',
        textUnderlineOffset: theme.spacing(0.5),
        whiteSpace: 'nowrap',
        ...(clampText
            ? {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  display: 'block',
              }
            : {}),
    }),
);

interface ITooltipLinkProps extends LinkProps {
    tooltip: ReactNode;
    highlighted?: boolean;
    tooltipProps?: Omit<IHtmlTooltipProps, 'title' | 'children'>;
    children: ReactNode;
    clampText?: boolean;
}

export const TooltipLink = ({
    tooltip,
    highlighted,
    tooltipProps,
    children,
    clampText,
    ...props
}: ITooltipLinkProps) => (
    <HtmlTooltip title={tooltip} {...tooltipProps} arrow>
        <StyledLink
            tabIndex={0}
            highlighted={highlighted}
            clampText={clampText}
            {...props}
        >
            {children}
        </StyledLink>
    </HtmlTooltip>
);
