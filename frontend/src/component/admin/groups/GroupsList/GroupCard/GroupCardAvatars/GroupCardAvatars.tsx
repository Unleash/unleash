import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IGroupUser } from 'interfaces/group';
import type React from 'react';
import { useMemo, useState } from 'react';
import { GroupPopover } from './GroupPopover/GroupPopover';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

const StyledAvatars = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: theme.spacing(1),
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    outline: `${theme.spacing(0.25)} solid ${theme.palette.background.paper}`,
    marginLeft: theme.spacing(-1),
    '&:hover': {
        outlineColor: theme.palette.primary.main,
    },
}));

interface IGroupCardAvatarsProps {
    users: IGroupUser[];
}

/**
 * @deprecated Remove after with `projectsListNewCards` flag
 */
export const GroupCardAvatars = ({ users }: IGroupCardAvatarsProps) => {
    const shownUsers = useMemo(
        () =>
            users
                .sort((a, b) => b?.joinedAt!.getTime() - a?.joinedAt!.getTime())
                .slice(0, 9),
        [users],
    );

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [popupUser, setPopupUser] = useState<IGroupUser>();

    const onPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onPopoverClose = () => {
        setAnchorEl(null);
    };

    const avatarOpen = Boolean(anchorEl);

    return (
        <StyledAvatars>
            {shownUsers.map((user) => (
                <StyledAvatar
                    key={user.id}
                    user={user}
                    onMouseEnter={(event) => {
                        onPopoverOpen(event);
                        setPopupUser(user);
                    }}
                    onMouseLeave={onPopoverClose}
                />
            ))}
            <ConditionallyRender
                condition={users.length > 9}
                show={
                    <StyledAvatar>
                        +{users.length - shownUsers.length}
                    </StyledAvatar>
                }
            />
            <GroupPopover
                open={avatarOpen}
                user={popupUser}
                anchorEl={anchorEl}
                onPopoverClose={onPopoverClose}
            />
        </StyledAvatars>
    );
};
