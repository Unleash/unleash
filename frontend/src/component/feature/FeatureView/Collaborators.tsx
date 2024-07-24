import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { Collaborator } from 'interfaces/featureToggle';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

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
}));

const GridDescription = styled('span')({ gridArea: 'description' });
const GridTooltip = styled(HtmlTooltip)({ gridArea: 'avatar' });
const GridLink = styled(Link)({ gridArea: 'link' });

const LastModifiedBy: FC<Collaborator> = ({ id, name, imageUrl }) => {
    return (
        <LastModifiedByContainer>
            <GridDescription>Last modified by</GridDescription>
            <GridTooltip arrow describeChild title={name}>
                <span>
                    <StyledAvatar user={{ id, name, imageUrl }} hideTitle />
                </span>
            </GridTooltip>
            <GridLink to='logs'>view change</GridLink>
        </LastModifiedByContainer>
    );
};

const CollaboratorListContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'flex-start',
    height: 'min-content',
}));

const CollaboratorList: FC<{ collaborators: Collaborator[] }> = ({
    collaborators,
}) => {
    return (
        <CollaboratorListContainer>
            <span className='description'>Collaborators</span>
            <GroupCardAvatars
                users={collaborators}
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
    collaborators: Collaborator[] | undefined;
};

export const Collaborators: FC<Props> = ({ collaborators }) => {
    if (!collaborators || collaborators.length === 0) {
        return null;
    }

    const lastModifiedBy = collaborators[0];

    return (
        <Container>
            <LastModifiedBy {...lastModifiedBy} />
            <CollaboratorList collaborators={collaborators} />
        </Container>
    );
};
