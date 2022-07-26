import {
    Avatar,
    AvatarProps,
    Badge,
    styled,
    SxProps,
    Theme,
} from '@mui/material';
import { IUser } from 'interfaces/user';
import { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import StarIcon from '@mui/icons-material/Star';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: 'auto',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

const StyledStar = styled(StarIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(-1),
}));

interface IUserAvatarProps extends AvatarProps {
    user?: IUser;
    star?: boolean;
    src?: string;
    title?: string;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: () => void;
    className?: string;
    sx?: SxProps<Theme>;
}

export const UserAvatar: FC<IUserAvatarProps> = ({
    user,
    star,
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

    const avatar = (
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

    return (
        <ConditionallyRender
            condition={Boolean(star)}
            show={
                <Badge
                    overlap="circular"
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    badgeContent={<StyledStar />}
                >
                    {avatar}
                </Badge>
            }
            elseShow={avatar}
        />
    );
};
