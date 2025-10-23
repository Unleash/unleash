import {
    Avatar,
    type AvatarProps,
    Box,
    styled,
    type SxProps,
    type Theme,
} from '@mui/material';
import type { IUser } from 'interfaces/user';
import { forwardRef } from 'react';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip.tsx';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    margin: 'auto',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

const StyledTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledTooltipAvatar = styled(StyledAvatar)(({ theme }) => ({
    width: theme.spacing(5),
    height: theme.spacing(5),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledTooltipContent = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
});

export interface IUserAvatarProps extends AvatarProps {
    user?: Partial<
        Pick<IUser, 'id' | 'name' | 'email' | 'username' | 'imageUrl'>
    >;
    src?: string;
    className?: string;
    sx?: SxProps<Theme>;
    disableTooltip?: boolean;
}

const tooltipContent = (
    user: IUserAvatarProps['user'],
): { main: string; secondary?: string } | undefined => {
    if (!user) {
        return undefined;
    }

    const [mainIdentifier, secondaryInfo] = [
        user.name,
        user.email || user.username,
    ];

    if (mainIdentifier) {
        return { main: mainIdentifier, secondary: secondaryInfo };
    } else if (secondaryInfo) {
        return { main: secondaryInfo };
    } else if (user.id) {
        return { main: `User ID: ${user.id}` };
    }

    return undefined;
};

const TooltipSecondaryContent = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const TooltipMainContent = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    overflowWrap: 'anywhere',
}));

export const UserAvatar = forwardRef<HTMLDivElement, IUserAvatarProps>(
    ({ user, src, className, sx, children, disableTooltip, ...props }, ref) => {
        let fallback: string | undefined;
        if (!children && user) {
            fallback = user?.name || user?.email || user?.username;
            if (fallback?.includes(' ')) {
                fallback = `${fallback.split(' ')[0][0]}${
                    fallback.split(' ')[1][0]
                }`.toUpperCase();
            } else if (fallback) {
                fallback = fallback[0].toUpperCase();
            }
        }

        const Avatar = (
            <StyledAvatar
                ref={ref}
                className={className}
                sx={sx}
                {...props}
                data-loading
                alt={user?.name || user?.email || user?.username || 'Gravatar'}
                src={src || user?.imageUrl}
            >
                {fallback ? fallback : children}
            </StyledAvatar>
        );

        const tooltip = disableTooltip ? undefined : tooltipContent(user);
        if (tooltip) {
            const { main, secondary } = tooltip;

            return (
                <HtmlTooltip
                    arrow
                    describeChild
                    maxWidth={400}
                    title={
                        <StyledTooltip>
                            <StyledTooltipAvatar
                                src={src || user?.imageUrl}
                                alt={
                                    user?.name ||
                                    user?.email ||
                                    user?.username ||
                                    'Gravatar'
                                }
                            >
                                {fallback ? fallback : children}
                            </StyledTooltipAvatar>
                            <StyledTooltipContent>
                                {main && (
                                    <TooltipMainContent>
                                        {main}
                                    </TooltipMainContent>
                                )}
                                {secondary && (
                                    <TooltipSecondaryContent>
                                        {secondary}
                                    </TooltipSecondaryContent>
                                )}
                            </StyledTooltipContent>
                        </StyledTooltip>
                    }
                >
                    {Avatar}
                </HtmlTooltip>
            );
        }

        return Avatar;
    },
);
