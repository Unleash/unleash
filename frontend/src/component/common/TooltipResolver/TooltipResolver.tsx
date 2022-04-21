import { Tooltip, TooltipProps } from '@material-ui/core';

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
