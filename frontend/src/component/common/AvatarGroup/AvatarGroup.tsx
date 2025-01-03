import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IGroupUser } from 'interfaces/group';
import {
    type ForwardRefExoticComponent,
    type FunctionComponent,
    type RefAttributes,
    useMemo,
} from 'react';
import {
    type IUserAvatarProps,
    UserAvatar,
} from 'component/common/UserAvatar/UserAvatar';
import { objectId } from 'utils/objectId';
import millify from 'millify';

const StyledAvatars = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: theme.spacing(1),
    justifyContent: 'start',
}));

export type AvatarComponentType =
    | FunctionComponent<IUserAvatarProps>
    | ForwardRefExoticComponent<
          IUserAvatarProps & RefAttributes<HTMLDivElement>
      >;

export const AvatarComponent = styled(UserAvatar)(({ theme }) => ({
    outline: `${theme.spacing(0.25)} solid ${theme.palette.background.paper}`,
    margin: 0,
    marginLeft: theme.spacing(-1),
    '&:hover': {
        outlineColor: theme.palette.primary.main,
    },
})) as AvatarComponentType;

type User = {
    name: string;
    description?: string;
    imageUrl?: string;
};

type AvatarGroupProps = {
    users: User[];
    avatarLimit?: number;
    AvatarComponent?: AvatarComponentType;
    className?: string;
};

export const AvatarGroup = ({ ...props }: AvatarGroupProps) => (
    <AvatarGroupInner
        AvatarComponent={props.AvatarComponent ?? AvatarComponent}
        {...props}
    />
);

type AvatarGroupInnerProps = Omit<AvatarGroupProps, 'AvatarComponent'> & {
    AvatarComponent: AvatarComponentType;
};

const MAX_OVERFLOW_DISPLAY_NUMBER = 99;

const AvatarGroupInner = ({
    users = [],
    avatarLimit = 9,
    AvatarComponent,
    className,
}: AvatarGroupInnerProps) => {
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
        [users, avatarLimit],
    );

    const overflow = users.length - avatarLimit;

    return (
        <StyledAvatars className={className}>
            {shownUsers.map((user) => (
                <AvatarComponent key={objectId(user)} user={user} />
            ))}
            <ConditionallyRender
                condition={overflow > 0}
                show={
                    <AvatarComponent
                        user={{
                            username: `Total: ${millify(users.length)}`,
                        }}
                    >
                        +{Math.min(overflow, MAX_OVERFLOW_DISPLAY_NUMBER)}
                    </AvatarComponent>
                }
            />
        </StyledAvatars>
    );
};
