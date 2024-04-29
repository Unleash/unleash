import { styled, type SxProps, type Theme } from '@mui/material';
import type React from 'react';
import {
    cloneElement,
    type FC,
    type ForwardedRef,
    forwardRef,
    type ReactElement,
    type ReactNode,
} from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

type Color =
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'secondary'
    | 'neutral'
    | 'disabled'; // TODO: refactor theme

interface IBadgeProps {
    as?: React.ElementType;
    color?: Color;
    icon?: ReactElement;
    iconRight?: boolean;
    className?: string;
    sx?: SxProps<Theme>;
    children?: ReactNode;
    title?: string;
    onClick?: (event: React.SyntheticEvent) => void;
}

interface IBadgeIconProps {
    color?: Color;
    iconRight?: boolean;
}

const StyledBadge = styled('span')<IBadgeProps>(
    ({ theme, color = 'neutral', icon }) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: theme.spacing(icon ? 0.375 : 0.625, 1),
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.bold,
        lineHeight: 1,
        ...(color === 'disabled'
            ? {
                  color: theme.palette.text.secondary,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
              }
            : {
                  backgroundColor: theme.palette[color].light,
                  color: theme.palette[color].contrastText,
                  border: `1px solid ${theme.palette[color].border}`,
              }),
    }),
);

const StyledBadgeIcon = styled('span')<
    IBadgeIconProps & { hasChildren?: boolean }
>(({ theme, color = 'neutral', iconRight = false, hasChildren }) => ({
    display: 'flex',
    color:
        color === 'disabled'
            ? theme.palette.action.disabled
            : theme.palette[color].main,
    margin: iconRight
        ? theme.spacing(0, 0, 0, hasChildren ? 0.5 : 0)
        : theme.spacing(0, hasChildren ? 0.5 : 0, 0, 0),
}));

const BadgeIcon = (
    color: Color,
    icon: ReactElement,
    iconRight = false,
    hasChildren = false,
) => (
    <StyledBadgeIcon
        color={color}
        iconRight={iconRight}
        hasChildren={hasChildren}
    >
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
);

export const Badge: FC<IBadgeProps> = forwardRef(
    (
        {
            as = 'span',
            color = 'neutral',
            icon,
            iconRight,
            className,
            sx,
            children,
            ...props
        }: IBadgeProps,
        ref: ForwardedRef<HTMLDivElement>,
    ) => (
        <StyledBadge
            as={as}
            tabIndex={0}
            color={color}
            icon={icon}
            className={className}
            sx={sx}
            {...props}
            ref={ref}
        >
            <ConditionallyRender
                condition={Boolean(icon) && !iconRight}
                show={BadgeIcon(color, icon!, false, Boolean(children))}
            />
            {children}
            <ConditionallyRender
                condition={Boolean(icon) && Boolean(iconRight)}
                show={BadgeIcon(color, icon!, true, Boolean(children))}
            />
        </StyledBadge>
    ),
);
