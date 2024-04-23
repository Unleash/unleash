import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IGroupUser } from 'interfaces/group';
import type React from 'react';
import { type ReactNode, useMemo, useState } from 'react';
import { GroupPopover } from './GroupPopover/GroupPopover';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { IUser } from 'interfaces/user';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

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

const StyledUsername = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(1),
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    margin: theme.spacing(0, 0, 1),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
}));

interface IGroupCardAvatarsProps {
    users: IUser[] | IGroupUser[];
    groups?: any[]; // FIXME: type
    header?: ReactNode;
    withDescription?: boolean;
}

export const GroupCardAvatars = ({
    users = [],
    groups = [],
    header = null,
    withDescription = false,
}: IGroupCardAvatarsProps) => {
    const shownUsers = useMemo(
        () =>
            users
                .sort((a, b) => {
                    if (
                        Object.hasOwn(a, 'joinedAt') &&
                        Object.hasOwn(b, 'joinedAt')
                    ) {
                        return (
                            (b as IGroupUser)?.joinedAt!.getTime() -
                            (a as IGroupUser)?.joinedAt!.getTime()
                        );
                    }
                    return 0;
                })
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
        <StyledContainer>
            <ConditionallyRender
                condition={typeof header === 'string'}
                show={<StyledHeader>{header}</StyledHeader>}
                elseShow={header}
            />
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

                <ConditionallyRender
                    condition={
                        withDescription &&
                        users.length === 1 &&
                        groups?.length === 0
                    }
                    show={() => (
                        <StyledUsername>
                            {users[0].name || users[0].username}
                        </StyledUsername>
                    )}
                />
                <GroupPopover
                    open={avatarOpen}
                    user={popupUser}
                    anchorEl={anchorEl}
                    onPopoverClose={onPopoverClose}
                />
            </StyledAvatars>
        </StyledContainer>
    );
};
