import {
    Avatar,
    type AvatarProps,
    styled,
    type SxProps,
    type Theme,
} from '@mui/material';
import type { IUser } from 'interfaces/user';
import type { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip';
const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    margin: 'auto',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

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
        user.email || user.username,
        user.name,
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
}));

export const UserAvatar: FC<IUserAvatarProps> = ({
    user,
    src,
    className,
    sx,
    children,
    disableTooltip,
    ...props
}) => {
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
            className={className}
            sx={sx}
            {...props}
            data-loading
            alt={user?.name || user?.email || user?.username || 'Gravatar'}
            src={src || user?.imageUrl}
        >
            <ConditionallyRender
                condition={Boolean(fallback)}
                show={fallback}
                elseShow={children}
            />
        </StyledAvatar>
    );

    const tooltip = disableTooltip ? undefined : tooltipContent(user);
    if (tooltip) {
        return (
            <HtmlTooltip
                arrow
                describeChild
                title={
                    <>
                        <TooltipSecondaryContent>
                            {tooltip.secondary}
                        </TooltipSecondaryContent>
                        <TooltipMainContent>{tooltip.main}</TooltipMainContent>
                    </>
                }
            >
                {Avatar}
            </HtmlTooltip>
        );
    }

    return Avatar;
};
