import { styled, Typography, useTheme } from '@mui/material';
import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';
import { WhitePulsingAvatar } from '../project/Project/Import/PulsingAvatar';
import Pending from '@mui/icons-material/Pending';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useEffect } from 'react';

interface IConnectionInformationProps {
    onConnection: () => void;
    projectId: string;
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

export const ConnectionInformation = ({
    onConnection,
    projectId,
}: IConnectionInformationProps) => {
    const theme = useTheme();
    const { project } = useProjectOverview(projectId, {
        refreshInterval: 1000,
    });

    const onboarded = project.onboardingStatus.status === 'onboarded';

    useEffect(() => {
        if (onboarded) {
            onConnection();
        }
    }, [onboarded]);

    return (
        <Container>
            <Title>Connection information</Title>
            <SdkInfo>
                <Info>
                    <Typography fontWeight='bold' variant='body2'>
                        Environment
                    </Typography>
                    <Typography variant='body2'>Development</Typography>
                </Info>
                <Info>
                    <Typography fontWeight='bold' variant='body2'>
                        SDK
                    </Typography>
                    <Typography variant='body2'>NodeJS</Typography>
                </Info>
            </SdkInfo>
            <ConnectionStatus>
                <Typography fontWeight='bold' variant='body2'>
                    Connection status
                </Typography>
                <Typography sx={{ mb: theme.spacing(4) }} variant='body2'>
                    Waiting for SDK data...
                </Typography>
                <ConditionallyRender
                    condition={true}
                    show={
                        <WhitePulsingAvatar
                            sx={{
                                width: 80,
                                height: 80,
                            }}
                            active={true}
                        >
                            <Pending fontSize='large' />
                        </WhitePulsingAvatar>
                    }
                />
            </ConnectionStatus>
        </Container>
    );
};
