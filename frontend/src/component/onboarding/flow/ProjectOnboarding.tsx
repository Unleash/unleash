import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import {
    UPDATE_PROJECT,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { FlagCreationButton } from '../../project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/FlagCreationButton/FlagCreationButton.tsx';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { SdkExample } from './SdkExample.tsx';
import CloseIcon from '@mui/icons-material/Close';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
    setOnboardingFlow: (status: 'visible' | 'closed') => void;
    refetchFeatures: () => void;
}

interface ICreateFlagProps {
    projectId: string;
    refetchFeatures: () => void;
}

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    flexBasis: '70%',
    borderRadius: theme.shape.borderRadiusLarge,
}));

const TitleBox = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 2.5, 2, 5),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    minHeight: '80px',
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    padding: theme.spacing(0, 1),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        padding: theme.spacing(0),
    },
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
        borderRight: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&:last-child': {
        borderWidth: 0,
    },
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
    refetchFeatures,
}: IProjectOnboardingProps) => {
    const { project } = useProjectOverview(projectId);
    const isFirstFlagCreated =
        project.onboardingStatus?.status === 'first-flag-created';

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
                    {project.onboardingStatus?.status ===
                    'first-flag-created' ? (
                        <ExistingFlag />
                    ) : (
                        <CreateFlag
                            projectId={projectId}
                            refetchFeatures={refetchFeatures}
                        />
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
                        permission={[UPDATE_PROJECT, CREATE_PROJECT_API_TOKEN]}
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

const CreateFlag = ({ projectId, refetchFeatures }: ICreateFlagProps) => {
    const { refetch } = useProjectOverview(projectId);
    return (
        <>
            <TitleContainer>
                <NeutralCircleContainer>1</NeutralCircleContainer>
                Create a feature flag
            </TitleContainer>
            <Typography>
                The project currently holds no feature flags. Create one to get
                started.
            </Typography>
            <FlagCreationButton
                text='Create flag'
                skipNavigationOnComplete={true}
                onSuccess={() => {
                    refetch();
                    refetchFeatures();
                }}
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
                    Congratulations, your first flag is ready!
                </Typography>
                <Typography variant='body2'>
                    You can open it to customize further.
                </Typography>
            </SuccessContainer>
        </ExistingFlagContainer>
    );
};
