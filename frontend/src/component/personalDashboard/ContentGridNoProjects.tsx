import { Grid, Typography, styled } from '@mui/material';
import { OwnerAvatarGroup } from 'component/common/OwnerAvatarGroup/OwnerAvatarGroup';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ProjectSchemaOwners } from 'openapi';
import { Link } from 'react-router-dom';

const ContentGrid = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const SpacedGridItem = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(4),
    border: `0.5px solid ${theme.palette.divider}`,
}));

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const NeutralCircleContainer = styled('span')(({ theme }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutral.border,
    borderRadius: '50%',
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(4, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

export const ContentGridNoProjects = () => {
    const { projects } = useProjects();

    const owners = projects.reduce(
        (acc, project) => {
            for (const owner of project.owners ?? []) {
                if (owner.ownerType === 'user') {
                    acc[owner.email || owner.name] = owner;
                }
            }
            return acc;
        },
        {} as Record<string, ProjectSchemaOwners[number]>,
    );

    return (
        <ContentGrid container columns={{ lg: 12, md: 1 }}>
            <SpacedGridItem item lg={4} md={1}>
                <Typography variant='h3'>My projects</Typography>
            </SpacedGridItem>
            <SpacedGridItem
                item
                lg={8}
                md={1}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                <Typography>Potential next steps</Typography>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                <ActionBox>
                    <Typography>
                        You don't currently have access to any projects in the
                        system.
                    </Typography>
                    <Typography>
                        To get started, you can{' '}
                        <Link to='/projects?create=true'>
                            create your own project
                        </Link>
                        . Alternatively, you can review the available projects
                        in the system and ask the owner for access.
                    </Typography>
                </ActionBox>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                <ActionBox>
                    <TitleContainer>
                        <NeutralCircleContainer>1</NeutralCircleContainer>
                        Contact Unleash admin
                    </TitleContainer>
                    <div>
                        <p>Your Unleash administrator is:</p>
                        <p>... someone, I guess? </p>
                    </div>
                </ActionBox>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                <ActionBox>
                    <TitleContainer>
                        <NeutralCircleContainer>2</NeutralCircleContainer>
                        Ask a project owner to add you to their project
                    </TitleContainer>
                    <div>
                        <p>Project owners in Unleash:</p>
                        <OwnerAvatarGroup
                            users={Object.values(owners)}
                            avatarLimit={9}
                        />
                    </div>
                </ActionBox>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1} />
            <SpacedGridItem item lg={8} md={1} />
        </ContentGrid>
    );
};
