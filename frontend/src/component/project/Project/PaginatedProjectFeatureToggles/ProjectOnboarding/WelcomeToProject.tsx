import { styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { FlagCreationButton } from '../ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';

interface IWelcomeToProjectProps {
    projectId: string;
}

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    flexBasis: '70%',
    borderRadius: theme.shape.borderRadiusLarge,
}));

const TitleBox = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 7, 2, 7),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(3, 2, 10, 8),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const CircleContainer = styled('span')(({ theme }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutral.border,
    borderRadius: '50%',
}));

export const WelcomeToProject = ({ projectId }: IWelcomeToProjectProps) => {
    return (
        <Container>
            <TitleBox>
                <Typography fontWeight='bold'>
                    Welcome to your project
                </Typography>
                <Typography variant='body2'>
                    Complete the steps below to start working with this project
                </Typography>
            </TitleBox>
            <Actions>
                <ActionBox>
                    <TitleContainer>
                        <CircleContainer>1</CircleContainer>
                        Create a feature flag
                    </TitleContainer>
                    <Typography>
                        <div>
                            The project currently holds no feature toggles.
                        </div>
                        <div>Create a feature flag to get started.</div>
                    </Typography>
                    <FlagCreationButton />
                </ActionBox>
                <ActionBox>
                    <TitleContainer>
                        <CircleContainer>2</CircleContainer>
                        Connect an SDK
                    </TitleContainer>
                    <Typography>
                        We have not detected any connected SDKs on this project.
                    </Typography>
                    <ResponsiveButton
                        onClick={() => {}}
                        maxWidth='960px'
                        projectId={projectId}
                        Icon={Add}
                        disabled={true}
                        permission={CREATE_FEATURE}
                    >
                        Connect SDK
                    </ResponsiveButton>
                </ActionBox>
            </Actions>
        </Container>
    );
};
