import { styled } from '@mui/material';
import { WelcomeToProject } from './WelcomeToProject';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
}

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    gap: theme.spacing(2),
}));

const SdkExample = styled('div')(({ theme }) => ({
    flexBasis: '30%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
}));

export const ProjectOnboarding = ({
    projectId,
    setConnectSdkOpen,
}: IProjectOnboardingProps) => {
    return (
        <Container>
            <WelcomeToProject
                projectId={projectId}
                setConnectSdkOpen={setConnectSdkOpen}
            />
            <SdkExample>View SDK example</SdkExample>
        </Container>
    );
};
