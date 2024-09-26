import { Grid, Typography, styled } from '@mui/material';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';

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
                <Typography>
                    You have not created any projects yet. Once you do, they
                    will show up here.
                </Typography>
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
                        <AvatarGroup
                            users={[
                                {
                                    name: 'John Doe',
                                    email: '',
                                },
                                {
                                    name: 'Ash',
                                    email: '',
                                },
                                {
                                    name: 'Sam',
                                    email: '',
                                },
                            ]}
                        />
                    </div>
                </ActionBox>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1} />
            <SpacedGridItem item lg={8} md={1} />
        </ContentGrid>
    );
};
