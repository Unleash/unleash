import type { FC } from 'react';
import { Avatar, Box, Link, styled, Typography } from '@mui/material';
import { SectionHeader, StepperBox } from './SharedComponents.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { allSdks, type Sdk } from './sharedTypes.ts';
import { formatAssetPath } from 'utils/formatPath';
import { Stepper } from './Stepper.tsx';
import { Badge } from 'component/common/Badge/Badge';
import { Markdown } from 'component/common/Markdown/Markdown';
import { CodeRenderer, codeRenderSnippets } from './CodeRenderer.tsx';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 2, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const ChangeSdk = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    gap: theme.spacing(3),
    padding: theme.spacing(1, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
}));

interface ITestSdkConnectionProps {
    sdk: Sdk;
    apiKey: string;
    feature: string;
    onSdkChange: () => void;
}

export const TestSdkConnection: FC<ITestSdkConnectionProps> = ({
    sdk,
    apiKey,
    feature,
    onSdkChange,
}) => {
    const { uiConfig } = useUiConfig();

    const sdkIcon = allSdks.find((item) => item.name === sdk.name)?.icon;
    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;
    const apiUrl = sdk.type === 'client' ? clientApiUrl : frontendApiUrl;

    const snippet = (codeRenderSnippets[sdk.name] || '')
        .replace('<YOUR_API_TOKEN>', apiKey)
        .replace('<YOUR_API_URL>', apiUrl)
        .replaceAll('<YOUR_FLAG>', feature);
    const [connectSnippet, _productionSnippet, _otherResourcesSnippet] =
        snippet.split('---\n');

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <StepperBox>
                <Stepper active={2} steps={3} />
                <Badge color='secondary'>3/3 - Test connection</Badge>
            </StepperBox>
            <Box sx={{ mt: 2 }}>
                <ChangeSdk>
                    {sdkIcon ? (
                        <Avatar
                            variant='circular'
                            src={formatAssetPath(sdkIcon)}
                            alt={sdk.name}
                        />
                    ) : null}
                    <Link onClick={onSdkChange} component='button'>
                        Change SDK
                    </Link>
                </ChangeSdk>
                <SectionHeader>Setup the SDK</SectionHeader>
                <Markdown components={{ code: CodeRenderer }}>
                    {connectSnippet}
                </Markdown>
            </Box>
        </SpacedContainer>
    );
};

// Use a default export for lazy-loading
export default TestSdkConnection;
