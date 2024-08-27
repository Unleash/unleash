import { styled } from '@mui/material';
import {
    AvatarComponent,
    AvatarGroup,
} from 'component/common/AvatarGroup/AvatarGroup';
import type { Collaborator } from 'interfaces/featureToggle';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

const StyledAvatar = styled(StyledAvatarComponent)(() => ({
    marginLeft: 0,
}));

const SectionContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'flex-start',
    height: 'min-content',
    whiteSpace: 'nowrap',
}));

const LastModifiedByAvatarAndLink = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    gap: theme.spacing(1),
}));

const LastModifiedBy: FC<Collaborator> = ({ id, name, imageUrl }) => {
    return (
        <SectionContainer>
            <span>Last modified by</span>
            <LastModifiedByAvatarAndLink>
                <StyledAvatar user={{ id, name, imageUrl }} />
                <Link to='logs'>view change</Link>
            </LastModifiedByAvatarAndLink>
        </SectionContainer>
    );
};

const StyledAvatarGroup = styled(AvatarGroup)({
    flexWrap: 'nowrap',
});

const CollaboratorList: FC<{ collaborators: Collaborator[] }> = ({
    collaborators,
}) => {
    return (
        <SectionContainer>
            <span className='description'>Collaborators</span>
            <StyledAvatarGroup
                users={collaborators}
                avatarLimit={6}
                AvatarComponent={StyledAvatarComponent}
            />
        </SectionContainer>
    );
};

const Container = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'right',
    [theme.breakpoints.down('xl')]: {
        display: 'none',
    },
    fontSize: theme.typography.body2.fontSize,
    flex: 1,
}));

type Props = {
    collaborators: Collaborator[] | undefined;
};

const Separator = styled('div')(({ theme }) => ({
    maxWidth: theme.spacing(10),
    minWidth: theme.spacing(2),
    flexGrow: 1,
}));

export const Collaborators: FC<Props> = ({ collaborators }) => {
    if (!collaborators || collaborators.length === 0) {
        return null;
    }

    const lastModifiedBy = collaborators[0];

    return (
        <Container>
            <LastModifiedBy {...lastModifiedBy} />
            <Separator />
            <CollaboratorList collaborators={collaborators} />
        </Container>
    );
};
