import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { FC } from 'react';

type LastModifiedByProps = {
    id: number;
    name: string;
    imageUrl: string;
};
const LastModifiedBy: FC<LastModifiedByProps> = ({ id, name, imageUrl }) => {
    return <UserAvatar user={{ id, name, imageUrl }} />;
};

type CollaboratorListProps = {
    users: Array<{ id: number; name: string; imageUrl: string }>;
};
const Collaborators: FC<CollaboratorListProps> = ({ users }) => {
    return <GroupCardAvatars users={users} avatarLimit={8} />;
};

const Container = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
}));

type Props = {
    collaborators: IFeatureToggle['collaborators'];
};

export const Contributors: FC<Props> = ({ collaborators }) => {
    if (!collaborators || collaborators.users.length === 0) {
        return null;
    }

    const lastModifiedBy = collaborators.users[0];

    return (
        <Container>
            <LastModifiedBy {...lastModifiedBy} />
            <Collaborators users={collaborators.users} />
        </Container>
    );
};
