import { useState } from 'react';
import { Button, styled, Typography } from '@mui/material';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import CodeIcon from '@mui/icons-material/Code';

const BannerCard = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    paddingRight: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const IconBox = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.common.white,
}));

const ContentRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(2),
    alignItems: 'flex-end',
    justifyContent: 'space-between',
}));

const TextContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
});

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const PendingBadge = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const PendingDot = styled('span')(({ theme }) => ({
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
}));

interface FeatureConnectSdkBannerProps {
    projectId: string;
    featureId: string;
}

export const FeatureConnectSdkBanner = ({
    projectId,
    featureId,
}: FeatureConnectSdkBannerProps) => {
    const { project } = useProjectOverview(projectId);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    if (project.onboardingStatus.status === 'onboarded') {
        return null;
    }

    const environments =
        project.environments?.map((env) => env.environment) ?? [];

    return (
        <>
            <BannerCard>
                <IconBox>
                    <CodeIcon />
                </IconBox>
                <ContentRow>
                    <TextContainer>
                        <TitleRow>
                            <Typography
                                variant='body1'
                                fontWeight='bold'
                                color='text.primary'
                            >
                                Connect SDK
                            </Typography>
                            <PendingBadge>
                                <PendingDot />
                                <Typography
                                    variant='caption'
                                    color='warning.main'
                                >
                                    Pending
                                </Typography>
                            </PendingBadge>
                        </TitleRow>
                        <Typography variant='body2' color='text.secondary'>
                            You must connect an SDK to the project before you
                            can implement this flag in your code.
                        </Typography>
                    </TextContainer>
                    <Button
                        variant='contained'
                        onClick={() => setConnectSdkOpen(true)}
                    >
                        Connect SDK
                    </Button>
                </ContentRow>
            </BannerCard>
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => setConnectSdkOpen(false)}
                onFinish={() => setConnectSdkOpen(false)}
                project={projectId}
                environments={environments}
                feature={featureId}
            />
        </>
    );
};
