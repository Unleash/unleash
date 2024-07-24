import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

type LastModifiedByProps = {
    id: number;
    name: string;
    imageUrl: string;
};

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

const LastModifiedByContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
    'description description'
    'avatar link'
    `,
    rowGap: theme.spacing(0.5),
    columnGap: theme.spacing(1),
    alignItems: 'center',
    height: 'min-content',

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
            <HtmlTooltip arrow describeChild className='avatar' title={name}>
                <StyledAvatar user={{ id, name, imageUrl }} hideTitle />
            </HtmlTooltip>

            <Link className='link' to='logs'>
                view change
            </Link>
        </LastModifiedByContainer>
    );
};

type CollaboratorListProps = {
    users: Array<{ id: number; name: string; imageUrl: string }>;
};

const CollaboratorListContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'flex-start',
    height: 'min-content',
}));

const CollaboratorList: FC<CollaboratorListProps> = ({ users }) => {
    return (
        <CollaboratorListContainer>
            <span className='description'>Collaborators</span>
            <GroupCardAvatars
                users={users}
                avatarLimit={8}
                AvatarComponent={StyledAvatar}
            />
        </CollaboratorListContainer>
    );
};

const Container = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(10),
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xl')]: {
        display: 'none',
    },
}));

type Props = {
    collaborators: IFeatureToggle['collaborators'];
};

export const Collaborators: FC<Props> = ({ collaborators }) => {
    if (!collaborators || collaborators.users.length === 0) {
        return null;
    }

    const lastModifiedBy = collaborators.users[0];

    return (
        <Container>
            <LastModifiedBy {...lastModifiedBy} />
            <CollaboratorList users={collaborators.users} />
        </Container>
    );
};
