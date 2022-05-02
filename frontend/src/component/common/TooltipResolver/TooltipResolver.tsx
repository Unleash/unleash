import { Tooltip, TooltipProps } from '@mui/material';

interface ITooltipResolverProps extends Omit<TooltipProps, 'title'> {
    title: string | undefined;
}

export const TooltipResolver = ({
    title,
    children,
    ...rest
}: ITooltipResolverProps) => {
    if (!title) {
        return children;
    }

    return (
        <Tooltip {...rest} title={title}>
            {children}
        </Tooltip>
    );
};
