import { Avatar, Badge, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IGroupUser, Role } from 'interfaces/group';
import React, { useMemo, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { GroupPopover } from './GroupPopover/GroupPopover';

const StyledAvatars = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: theme.spacing(1),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
    outline: `2px solid ${theme.palette.background.paper}`,
    marginLeft: theme.spacing(-1),
}));

const StyledAvatarMore = styled(StyledAvatar)(({ theme }) => ({
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

interface IGroupCardAvatarsProps {
    users: IGroupUser[];
}

export const GroupCardAvatars = ({ users }: IGroupCardAvatarsProps) => {
    const shownUsers = useMemo(
        () => users.sort((a, b) => (a.role < b.role ? 1 : -1)).slice(0, 9),
        [users]
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
            {shownUsers.map(user => (
                <ConditionallyRender
                    key={user.id}
                    condition={user.role === Role.Member}
                    show={
                        <StyledAvatar
                            data-loading
                            alt="Gravatar"
                            src={user.imageUrl}
                            onMouseEnter={event => {
                                onPopoverOpen(event);
                                setPopupUser(user);
                            }}
                            onMouseLeave={onPopoverClose}
                        />
                    }
                    elseShow={
                        <Badge
                            overlap="circular"
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            badgeContent={<StyledStar />}
                        >
                            <StyledAvatar
                                data-loading
                                alt="Gravatar"
                                src={user.imageUrl}
                                onMouseEnter={event => {
                                    onPopoverOpen(event);
                                    setPopupUser(user);
                                }}
                                onMouseLeave={onPopoverClose}
                            />
                        </Badge>
                    }
                />
            ))}
            <ConditionallyRender
                condition={users.length > 9}
                show={
                    <StyledAvatarMore>
                        +{users.length - shownUsers.length}
                    </StyledAvatarMore>
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
