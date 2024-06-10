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

const StyledAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== 'avatarWidth',
})<{ avatarWidth?: (theme: Theme) => string }>(({ theme, avatarWidth }) => {
    const width = avatarWidth ? avatarWidth(theme) : theme.spacing(3.5);

    return {
        width,
        height: width,
        margin: 'auto',
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.text.primary,
        fontSize: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.bold,
    };
});

interface IUserAvatarProps extends AvatarProps {
    user?: Partial<
        Pick<IUser, 'id' | 'name' | 'email' | 'username' | 'imageUrl'>
    >;
    src?: string;
    title?: string;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: () => void;
    className?: string;
    sx?: SxProps<Theme>;
    avatarWidth?: (theme: Theme) => string;
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
    ...props
}) => {
    if (!title && !onMouseEnter && user) {
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

    return (
        <StyledAvatar
            className={className}
            sx={sx}
            {...props}
            data-loading
            alt='Gravatar'
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
    );
};
