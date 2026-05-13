import { Alert, alpha, styled, Typography } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { CodeRenderer, codeRenderSnippets } from '../CodeRenderer.tsx';
import { buildSdkApiUrl } from '../buildSdkApiUrl.ts';
import type { Sdk } from '../sharedTypes.ts';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview.ts';
import { useEffect, useState } from 'react';
import { PulsingAvatar } from 'component/common/PulsingAvatar/PulsingAvatar.tsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledSpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledSdkConnectionAlert = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
}));

const StyledSdkConnectedAlert = styled(StyledSdkConnectionAlert)(
    ({ theme }) => ({
        backgroundColor: theme.palette.success.light,
        border: `1px solid ${theme.palette.success.border}`,
    }),
);

const StyledPulsingAvatar = styled(PulsingAvatar)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3),
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0px ${alpha(theme.palette.primary.main, 0.4)}`,
        },
        '100%': {
            boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0.0)}`,
        },
    },
}));

const StyledConnectedIcon = styled(CheckCircleIcon)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: theme.palette.success.main,
}));

const StyledTroubleshootingAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(2, 3),
    '& .MuiAlert-message': {
        padding: 0,
    },
    '& .MuiAlert-icon': {
        marginRight: theme.spacing(1),
    },
}));

interface IConfigureSdkProps {
    projectId: string;
    sdk?: Pick<Sdk, 'name'>;
    apiKey?: string;
    feature?: string;
    isActive: boolean;
    onSdkConnected: () => void;
}

export const ConfigureSdk = ({
    projectId,
    sdk,
    apiKey,
    feature,
    isActive,
    onSdkConnected,
}: IConfigureSdkProps) => {
    const { uiConfig } = useUiConfig();
    const [flagName, setFlagName] = useState(feature);
    const [showTroubleshooting, setShowTroubleshooting] = useState(false);

    useEffect(() => {
        if (feature) {
            setFlagName(feature);
        }
    }, [feature]);

    const { project } = useProjectOverview(projectId, {
        refreshInterval: 1000,
    });
    const sdkConnected = project.onboardingStatus.status === 'sdk-connected';

    useEffect(() => {
        if (sdkConnected) {
            onSdkConnected();
        }
    }, [sdkConnected, onSdkConnected]);

    useEffect(() => {
        if (sdkConnected || !isActive) return;
        const timer = setTimeout(() => setShowTroubleshooting(true), 30_000);
        return () => clearTimeout(timer);
    }, [sdkConnected, isActive]);

    if (!sdk) return null;

    const apiUrl = buildSdkApiUrl(uiConfig.unleashUrl, sdk.name);

    const snippet = (codeRenderSnippets[sdk.name] || '')
        .replace('<YOUR_API_URL>', apiUrl)
        .replace('<YOUR_API_TOKEN>', apiKey || '<YOUR_API_TOKEN>')
        .replaceAll('<YOUR_FLAG>', flagName || '<YOUR_FLAG>');
    const [connectSnippet] = snippet.split('---\n');

    return (
        <StyledSpacedContainer>
            <div>
                <Markdown components={{ code: CodeRenderer }}>
                    {connectSnippet}
                </Markdown>
            </div>
            {sdkConnected ? (
                <StyledSdkConnectedAlert>
                    <div>
                        <StyledConnectedIcon />
                    </div>
                    <div>
                        <strong>
                            We received metrics from your application
                        </strong>
                        <Typography variant='body2' color='textSecondary'>
                            Your SDK is connected and evaluating flags.
                        </Typography>
                    </div>
                </StyledSdkConnectedAlert>
            ) : (
                <StyledSdkConnectionAlert>
                    <div>
                        <StyledPulsingAvatar active>
                            <MoreHorizIcon />
                        </StyledPulsingAvatar>
                    </div>
                    <div>
                        <strong>Waiting for SDK data...</strong>
                        <Typography variant='body2' color='textSecondary'>
                            Run your app and evaluate your flag. This step
                            completes on its own.
                        </Typography>
                        {showTroubleshooting && (
                            <StyledTroubleshootingAlert severity='warning'>
                                Not seeing evaluations after ~30s? Make sure
                                your app has started and that the client was
                                initialized with the API key from step 2.
                            </StyledTroubleshootingAlert>
                        )}
                    </div>
                </StyledSdkConnectionAlert>
            )}
        </StyledSpacedContainer>
    );
};
