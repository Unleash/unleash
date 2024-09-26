import { styled, Typography, useTheme } from '@mui/material';
import { WhitePulsingAvatar } from 'component/common/PulsingAvatar/PulsingAvatar';
import Pending from '@mui/icons-material/Pending';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import Check from '@mui/icons-material/Check';

interface IConnectionInformationProps {
    projectId: string;
    sdk: string;
    environment: string;
}
export const Container = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(6, 9, 6, 9),
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.primary.contrastText,
}));

export const Title = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeightBold,
}));

export const SdkInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(4, 0, 12, 0),
    justifyContent: 'space-between',
    fontSize: theme.spacing(1),
}));

export const Info = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexDirection: 'column',
}));

export const ConnectionStatus = styled('div')(({ theme }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'column',
    fontSize: theme.fontSizes.smallBody,
}));

export const StyledCheck = styled(Check)(({ theme }) => ({
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    padding: theme.spacing(1),
    width: '80px',
    height: '80px',
}));

export const ConnectionInformation = ({
    projectId,
    sdk,
    environment,
}: IConnectionInformationProps) => {
    const theme = useTheme();
    const { project } = useProjectOverview(projectId, {
        refreshInterval: 1000,
    });

    const onboarded = project.onboardingStatus.status === 'onboarded';

    return (
        <Container>
            <Title>Connection information</Title>
            <SdkInfo>
                <Info>
                    <Typography fontWeight='bold' variant='body2'>
                        Environment
                    </Typography>
                    <Typography variant='body2'>{environment}</Typography>
                </Info>
                <Info>
                    <Typography fontWeight='bold' variant='body2'>
                        SDK
                    </Typography>
                    <Typography variant='body2'>{sdk}</Typography>
                </Info>
            </SdkInfo>
            {onboarded ? (
                <ConnectionStatus>
                    <Typography fontWeight='bold' variant='body2'>
                        Connection status
                    </Typography>
                    <Typography sx={{ mb: theme.spacing(4) }} variant='body2'>
                        Connected
                    </Typography>
                    <StyledCheck />
                    <Typography sx={{ mb: theme.spacing(4) }} variant='body2'>
                        We received metrics from your application!
                    </Typography>
                </ConnectionStatus>
            ) : (
                <ConnectionStatus>
                    <Typography fontWeight='bold' variant='body2'>
                        Connection status
                    </Typography>
                    <Typography sx={{ mb: theme.spacing(4) }} variant='body2'>
                        Waiting for SDK data...
                    </Typography>
                    <WhitePulsingAvatar
                        sx={{
                            width: 80,
                            height: 80,
                        }}
                        active={true}
                    >
                        <Pending fontSize='large' />
                    </WhitePulsingAvatar>
                </ConnectionStatus>
            )}
        </Container>
    );
};
