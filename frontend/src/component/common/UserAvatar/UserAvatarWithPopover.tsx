import { styled, Popover } from '@mui/material';
import { useState, type FC } from 'react';
import type React from 'react';
import { type IUserAvatarProps, UserAvatar } from './UserAvatar';

type PopoverProps = {
    mainText: string;
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

const AvatarPopover = ({
    mainText,
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
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <p>{mainText}</p>
        </StyledPopover>
    );
};

type UserAvatarWithPopoverProps = Omit<
    IUserAvatarProps,
    'user' | 'onMouseEnter' | 'onMouseLeave'
> & {
    user: {
        name: string;
        imageUrl: string;
    };
};

export const UserAvatarWithPopover: FC<UserAvatarWithPopoverProps> = ({
    user,
    ...userAvatarProps
}) => {
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
            <UserAvatar
                {...userAvatarProps}
                user={user}
                data-loading
                onMouseEnter={(event) => {
                    onPopoverOpen(event);
                }}
                onMouseLeave={onPopoverClose}
            />
            <AvatarPopover
                mainText={user.name}
                open={avatarOpen}
                anchorEl={anchorEl}
                onPopoverClose={onPopoverClose}
            />
        </>
    );
};
