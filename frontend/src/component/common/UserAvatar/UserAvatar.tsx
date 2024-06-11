import {
    Avatar,
    type AvatarProps,
    styled,
    type SxProps,
    type Theme,
    Popover,
} from '@mui/material';
import type { IUser } from 'interfaces/user';
import { useState, type FC } from 'react';
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

type PopoverProps = {
    mainText: string;
    supplementaryText?: string;
    open: boolean;
    anchorEl: HTMLElement | null;
    onPopoverClose(event: React.MouseEvent<HTMLElement>): void;
};

const StyledPopover = styled(Popover)(({ theme }) => ({
    pointerEvents: 'none',
    '.MuiPaper-root': {
        padding: theme.spacing(1),
    },
}));

const StyledSupplementaryText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const AvatarPopover = ({
    mainText,
    supplementaryText,
    open,
    anchorEl,
    onPopoverClose,
}: PopoverProps) => {
    return (
        <StyledPopover
            open={open}
            anchorEl={anchorEl}
            onClose={onPopoverClose}
            disableScrollLock={true}
            disableRestoreFocus={true}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <ConditionallyRender
                condition={Boolean(supplementaryText)}
                show={
                    <StyledSupplementaryText>
                        {supplementaryText}
                    </StyledSupplementaryText>
                }
            />

            <p>{mainText}</p>
        </StyledPopover>
    );
};

export const UserAvatarWithPopover: FC<IUserAvatarProps> = ({
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

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const onPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onPopoverClose = () => {
        setAnchorEl(null);
    };

    const avatarOpen = Boolean(anchorEl);

    return (
        <>
            <StyledAvatar
                className={className}
                sx={sx}
                {...props}
                data-loading
                alt='Gravatar'
                src={src}
                title={title}
                onMouseEnter={(event) => {
                    onPopoverOpen(event);
                }}
                onMouseLeave={onPopoverClose}
            >
                <ConditionallyRender
                    condition={Boolean(fallback)}
                    show={fallback}
                    elseShow={children}
                />
            </StyledAvatar>
            <AvatarPopover
                mainText={user?.name || 'nothing'}
                supplementaryText={user?.id ? `id: ${user.id}` : undefined}
                open={avatarOpen}
                anchorEl={anchorEl}
                onPopoverClose={onPopoverClose}
            />
        </>
    );
};
