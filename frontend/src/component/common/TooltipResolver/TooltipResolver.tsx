import React, { ReactNode } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip';

export interface ITooltipResolverProps extends Omit<TooltipProps, 'title'> {
    title?: string | undefined;
    titleComponent?: ReactNode | undefined;
    variant?: 'default' | 'white';
}

export const TooltipResolver = ({
    title,
    children,
    variant = 'default',
    titleComponent,
    ...rest
}: ITooltipResolverProps) => {
    if (!title && !titleComponent) {
        return children;
    }

    if (variant === 'white') {
        return (
            <HtmlTooltip {...rest} title={title || titleComponent} arrow>
                {children}
            </HtmlTooltip>
        );
    }

    return (
        <Tooltip {...rest} title={title || titleComponent} arrow>
            {children}
        </Tooltip>
    );
};
