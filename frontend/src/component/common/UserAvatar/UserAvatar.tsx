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
    title?: string;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: () => void;
    className?: string;
    sx?: SxProps<Theme>;
    hideTitle?: boolean;
}

export const UserAvatar: FC<IUserAvatarProps> = ({
    user,
    src,
    title,
    onMouseEnter,
    onMouseLeave,
    className,
    sx,
    children,
    hideTitle,
    ...props
}) => {
    if (!hideTitle && !title && !onMouseEnter && user) {
        title = `${user?.name || user?.email || user?.username} (id: ${
            user?.id
        })`;
    }

    if (!src && user) {
        src = user?.imageUrl;
    }

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

    const StyledName = styled('div')(({ theme }) => ({
        color: theme.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
    }));
    const StyledEmail = styled('div')(({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
    }));

    return (
        <HtmlTooltip
            arrow
            describeChild
            title={
                <>
                    <StyledName>
                        {user?.name || user?.username} (id: {user?.id})
                    </StyledName>
                    <StyledEmail>{user?.email}</StyledEmail>
                </>
            }
        >
            <span>
                <StyledAvatar
                    className={className}
                    sx={sx}
                    {...props}
                    data-loading
                    alt={
                        user?.name ||
                        user?.email ||
                        user?.username ||
                        'Gravatar'
                    }
                    src={src}
                    title={title}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <ConditionallyRender
                        condition={Boolean(fallback)}
                        show={fallback}
                        elseShow={children}
                    />
                </StyledAvatar>
            </span>
        </HtmlTooltip>
    );
};
