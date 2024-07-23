import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

type LastModifiedByProps = {
    id: number;
    name: string;
    imageUrl: string;
};

const LastModifiedByContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        'description description'
        'avatar link'
    `,
    gap: theme.spacing(1),
    alignItems: 'center',
    height: 'min-content',
    fontSize: theme.typography.body2.fontSize,

    '.description': {
        gridArea: 'description',
    },
    '.avatar': {
        gridArea: 'avatar',
    },
    '.link': {
        gridArea: 'link',
    },
}));

const LastModifiedBy: FC<LastModifiedByProps> = ({ id, name, imageUrl }) => {
    return (
        <LastModifiedByContainer>
            <span className='description'>Last modified by</span>
            <UserAvatar className='avatar' user={{ id, name, imageUrl }} />
            <Link className='link' to='logs'>
                View change
            </Link>
        </LastModifiedByContainer>
    );
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
    alignItems: 'center',
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
