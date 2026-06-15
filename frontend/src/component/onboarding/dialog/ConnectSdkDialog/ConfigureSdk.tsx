import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { CodeRenderer, codeRenderSnippets } from '../CodeRenderer.tsx';
import { buildSdkApiUrl } from '../buildSdkApiUrl.ts';
import type { Sdk } from '../sharedTypes.ts';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview.ts';
import { useEffect, useState } from 'react';
import { SdkConnectionStatus } from 'component/onboarding/dialog/SdkEvaluationStatus';

const StyledSpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
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

    if (!sdk || !apiKey) return null;

    const apiUrl = buildSdkApiUrl(uiConfig.unleashUrl, sdk.name);

    const snippet = (codeRenderSnippets[sdk.name] || '')
        .replace('<YOUR_API_TOKEN>', apiKey)
        .replace('<YOUR_API_URL>', apiUrl)
        .replaceAll('<YOUR_FLAG>', flagName || '<YOUR_FLAG>');
    const [connectSnippet] = snippet.split('---\n');

    return (
        <StyledSpacedContainer>
            <div>
                <Markdown components={{ code: CodeRenderer }}>
                    {connectSnippet}
                </Markdown>
            </div>
            <SdkConnectionStatus
                sdkConnected={sdkConnected}
                connectedTitle='We received metrics from your application'
                connectedBody='Your SDK is connected and evaluating flags.'
                waitingTitle='Waiting for SDK data...'
                waitingBody='Run your app and evaluate your flag. This step completes on its own.'
                showTroubleshooting={showTroubleshooting}
                troubleshootingText='Not seeing evaluations after ~30s? Make sure your app has started and that the client was initialized with the API key from step 2.'
            />
        </StyledSpacedContainer>
    );
};
