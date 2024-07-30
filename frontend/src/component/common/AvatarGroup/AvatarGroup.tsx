import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IGroupUser } from 'interfaces/group';
import { useMemo } from 'react';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar'; // usage
import { objectId } from 'utils/objectId';

const StyledAvatars = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: theme.spacing(1),
}));

const StyledAvatar = (component: typeof UserAvatar) =>
    styled(component)(({ theme }) => ({
        outline: `${theme.spacing(0.25)} solid ${theme.palette.background.paper}`,
        marginLeft: theme.spacing(-1),
        '&:hover': {
            outlineColor: theme.palette.primary.main,
        },
    }));

type User = {
    name: string;
    description?: string;
    imageUrl?: string;
};
type AvatarGroupProps = {
    users: User[];
    avatarLimit?: number;
    AvatarComponent?: typeof UserAvatar;
};

export const AvatarGroup = ({
    AvatarComponent,
    ...props
}: AvatarGroupProps) => {
    const Avatar = StyledAvatar(AvatarComponent ?? UserAvatar);

    return <GroupCardAvatarsInner AvatarComponent={Avatar} {...props} />;
};

type GroupCardAvatarsInnerProps = Omit<AvatarGroupProps, 'AvatarComponent'> & {
    AvatarComponent: typeof UserAvatar;
};

const GroupCardAvatarsInner = ({
    users = [],
    avatarLimit = 9,
    AvatarComponent,
}: GroupCardAvatarsInnerProps) => {
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

    return (
        <StyledAvatars>
            {shownUsers.map((user) => (
                <AvatarComponent
                    key={objectId(user)}
                    user={{ ...user, id: objectId(user) }}
                />
            ))}
            <ConditionallyRender
                condition={users.length > avatarLimit}
                show={
                    <AvatarComponent>
                        +{users.length - shownUsers.length}
                    </AvatarComponent>
                }
            />
        </StyledAvatars>
    );
};
