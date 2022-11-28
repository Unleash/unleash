import React, { ReactNode } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip';

export interface ITooltipResolverProps extends Omit<TooltipProps, 'title'> {
    title: string | ReactNode | undefined;
    variant?: 'default' | 'white';
}

export const TooltipResolver = ({
    title,
    children,
    variant = 'default',
    ...rest
}: ITooltipResolverProps) => {
    if (!title) {
        return children;
    }

    if (variant === 'white') {
        return (
            <HtmlTooltip {...rest} title={title} arrow>
                {children}
            </HtmlTooltip>
        );
    }

    return (
        <Tooltip {...rest} title={title} arrow>
            {children}
        </Tooltip>
    );
};
