import type { FC } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { SectionHeader, StepperBox } from './SharedComponents';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { Sdk } from './sharedTypes';
import { Stepper } from './Stepper';
import { Badge } from '../common/Badge/Badge';
import { Markdown } from 'component/common/Markdown/Markdown';
import { CodeRenderer, codeRenderSnippets } from './CodeRenderer';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 2, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    fontSize: theme.typography.body2.fontSize,
}));

interface ISdkConnectedProps {
    sdk: Sdk;
}

export const SdkConnected: FC<ISdkConnectedProps> = ({ sdk }) => {
    const { uiConfig } = useUiConfig();

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;
    const apiUrl = sdk.type === 'client' ? clientApiUrl : frontendApiUrl;

    const snippet = (codeRenderSnippets[sdk.name] || '').replaceAll(
        '<YOUR_API_URL>',
        apiUrl,
    );

    const [_connectSnippet, productionSnippet, otherResourcesSnippet] =
        snippet.split('---\n');

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <StepperBox>
                <Stepper active={2} steps={3} />
                <Badge color='secondary'>3/3 - Test connection</Badge>
            </StepperBox>
            <Box sx={{ mt: 2 }}>
                <SectionHeader>Production settings</SectionHeader>
                <Typography variant='body2'>
                    In order to validate the connection, we changed some
                    settings that you might want to revert. We recommend the
                    following default settings.
                </Typography>
                <Markdown components={{ code: CodeRenderer }}>
                    {productionSnippet}
                </Markdown>
            </Box>
            <Box>
                <SectionHeader>Additional resources</SectionHeader>
                <Typography variant='body2'>
                    Now that we’ve validated the connection, you might want to
                    look into more advanced use cases and examples:
                </Typography>
                <Markdown components={{ code: CodeRenderer }}>
                    {otherResourcesSnippet}
                </Markdown>
            </Box>
        </SpacedContainer>
    );
};

// Use a default export for lazy-loading
export default SdkConnected;
