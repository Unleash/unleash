import { styled } from '@mui/material';
import { WelcomeToProject } from './WelcomeToProject';
import { SdkExample } from './SdkExample';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
}

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    gap: theme.spacing(2),
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
            <SdkExample />
        </Container>
    );
};
