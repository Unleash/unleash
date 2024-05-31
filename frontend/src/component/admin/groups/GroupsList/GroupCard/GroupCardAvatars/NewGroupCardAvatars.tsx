import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IGroupUser } from 'interfaces/group';
import type React from 'react';
import { type ReactNode, useMemo, useState } from 'react';
import { GroupPopover } from './GroupPopover/GroupPopover';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { objectId } from 'utils/objectId';

const StyledContainer = styled('div')(() => ({
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
    users: {
        name: string;
        description?: string;
        imageUrl?: string;
    }[];
    header?: ReactNode;
    avatarLimit?: number;
}

export const GroupCardAvatars = ({
    users = [],
    header = null,
    avatarLimit = 9,
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
                .slice(0, avatarLimit),
        [users],
    );

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [popupUser, setPopupUser] = useState<{
        name: string;
        description?: string;
        imageUrl?: string;
    }>();

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
                        key={objectId(user)}
                        user={{ ...user, id: objectId(user) }}
                        onMouseEnter={(event) => {
                            onPopoverOpen(event);
                            setPopupUser(user);
                        }}
                        onMouseLeave={onPopoverClose}
                    />
                ))}
                <ConditionallyRender
                    condition={users.length > avatarLimit}
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
        </StyledContainer>
    );
};
