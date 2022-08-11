import { Avatar, AvatarProps, styled, SxProps, Theme } from '@mui/material';
import { IUser } from 'interfaces/user';
import { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    margin: 'auto',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

interface IUserAvatarProps extends AvatarProps {
    user?: IUser;
    src?: string;
    title?: string;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: () => void;
    className?: string;
    sx?: SxProps<Theme>;
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

    let fallback;
    if (!children && user) {
        fallback = user?.name || user?.email || user?.username;
        if (fallback && fallback.includes(' ')) {
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
            alt="Gravatar"
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
