import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { FlagCreationButton } from '../ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { SdkExample } from './SdkExample';
import CloseIcon from '@mui/icons-material/Close';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
    setOnboardingFlow: (status: 'visible' | 'closed') => void;
}

interface ICreateFlagProps {
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
    minHeight: '80px',
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(3, 2, 6, 8),
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

const NeutralCircleContainer = styled('span')(({ theme }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutral.border,
    borderRadius: '50%',
}));

const MainCircleContainer = styled(NeutralCircleContainer)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
}));

const ExistingFlagContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    height: '100%',
}));

const SuccessContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',

    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
    backgroundColor: theme.palette.success.light,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2, 2, 2, 2),
}));

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

export const ProjectOnboarding = ({
    projectId,
    setConnectSdkOpen,
    setOnboardingFlow,
}: IProjectOnboardingProps) => {
    const { project } = useProjectOverview(projectId);
    const isFirstFlagCreated =
        project.onboardingStatus.status === 'first-flag-created';

    const closeOnboardingFlow = () => {
        setOnboardingFlow('closed');
    };

    return (
        <Container>
            <TitleBox>
                <TitleRow>
                    <Typography fontWeight='bold'>
                        Welcome to your project
                    </Typography>
                    <Tooltip title='Close' arrow>
                        <IconButton onClick={closeOnboardingFlow} size='small'>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </TitleRow>
                <Typography variant='body2'>
                    Complete the steps below to start working with this project
                </Typography>
            </TitleBox>
            <Actions>
                <ActionBox>
                    {project.onboardingStatus.status ===
                    'first-flag-created' ? (
                        <ExistingFlag />
                    ) : (
                        <CreateFlag projectId={projectId} />
                    )}
                </ActionBox>
                <ActionBox>
                    <TitleContainer>
                        <NeutralCircleContainer>2</NeutralCircleContainer>
                        Connect an SDK
                    </TitleContainer>
                    <Typography>
                        Your project is not yet connected to any SDK. To start
                        using your feature flag, connect an SDK to the project.
                    </Typography>
                    <ResponsiveButton
                        onClick={() => {
                            setConnectSdkOpen(true);
                        }}
                        maxWidth='200px'
                        projectId={projectId}
                        Icon={Add}
                        disabled={!isFirstFlagCreated}
                        permission={CREATE_FEATURE}
                    >
                        Connect SDK
                    </ResponsiveButton>
                </ActionBox>
                <ActionBox>
                    <SdkExample />
                </ActionBox>
            </Actions>
        </Container>
    );
};

const CreateFlag = ({ projectId }: ICreateFlagProps) => {
    const { refetch } = useProjectOverview(projectId);
    return (
        <>
            <TitleContainer>
                <NeutralCircleContainer>1</NeutralCircleContainer>
                Create a feature flag
            </TitleContainer>
            <Typography>
                <div>The project currently holds no feature flags.</div>
                <div>Create one to get started.</div>
            </Typography>
            <FlagCreationButton
                text='Create flag'
                skipNavigationOnComplete={true}
                onSuccess={refetch}
            />
        </>
    );
};

const ExistingFlag = () => {
    return (
        <ExistingFlagContainer>
            <TitleContainer>
                <MainCircleContainer>✓</MainCircleContainer>
                Create a feature flag
            </TitleContainer>
            <SuccessContainer>
                <Typography fontWeight='bold' variant='body2'>
                    Congratulations! You have created your first flag
                </Typography>
                <Typography variant='body2'>
                    Click into the flag below to customize the flag further
                </Typography>
            </SuccessContainer>
        </ExistingFlagContainer>
    );
};
