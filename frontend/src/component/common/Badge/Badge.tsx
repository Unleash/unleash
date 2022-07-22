import { styled, SxProps, Theme } from '@mui/material';
import {
    cloneElement,
    FC,
    ForwardedRef,
    forwardRef,
    ReactElement,
    ReactNode,
} from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

type Color = 'info' | 'success' | 'warning' | 'error' | 'secondary' | 'neutral';

interface IBadgeProps {
    color?: Color;
    icon?: ReactElement;
    className?: string;
    sx?: SxProps<Theme>;
    children?: ReactNode;
}

interface IBadgeIconProps {
    color?: Color;
}

const StyledBadge = styled('div')<IBadgeProps>(
    ({ theme, color = 'neutral' }) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 1),
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.fontSizes.smallerBody,
        backgroundColor: theme.palette[color].light,
        color: theme.palette[color].dark,
        border: `1px solid ${theme.palette[color].border}`,
    })
);

const StyledBadgeIcon = styled('div')<IBadgeIconProps>(
    ({ theme, color = 'neutral' }) => ({
        display: 'flex',
        color: theme.palette[color].main,
        marginRight: theme.spacing(0.5),
    })
);

export const Badge: FC<IBadgeProps> = forwardRef(
    (
        {
            color = 'neutral',
            icon,
            className,
            sx,
            children,
            ...props
        }: IBadgeProps,
        ref: ForwardedRef<HTMLDivElement>
    ) => (
        <StyledBadge
            color={color}
            className={className}
            sx={sx}
            {...props}
            ref={ref}
        >
            <ConditionallyRender
                condition={Boolean(icon)}
                show={
                    <StyledBadgeIcon color={color}>
                        <ConditionallyRender
                            condition={Boolean(icon?.props.sx)}
                            show={icon}
                            elseShow={() =>
                                cloneElement(icon!, {
                                    sx: { fontSize: '16px' },
                                })
                            }
                        />
                    </StyledBadgeIcon>
                }
            />
            {children}
        </StyledBadge>
    )
);
