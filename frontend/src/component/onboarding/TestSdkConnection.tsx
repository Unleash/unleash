import type { FC } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { SectionHeader } from './SharedComponents';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { Sdk } from './sharedTypes';
import { codeSnippets, installCommands } from './sdkSnippets';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 8, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledCodeBlock = styled('pre')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    fontSize: theme.typography.body2.fontSize,
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
}));

interface ITestSdkConnectionProps {
    sdk: Sdk;
    apiKey: string;
}
export const TestSdkConnection: FC<ITestSdkConnectionProps> = ({
    sdk,
    apiKey,
}) => {
    const { uiConfig } = useUiConfig();

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;
    const apiUrl = sdk.type === 'client' ? clientApiUrl : frontendApiUrl;
    const codeSnippet =
        codeSnippets[sdk.name] || `No snippet found for the ${sdk.name} SDK`;
    const installCommand =
        installCommands[sdk.name] ||
        `No install command found for the ${sdk.name} SDK`;

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <Box sx={{ mt: 4 }}>
                <SectionHeader>Setup the SDK</SectionHeader>
                <p>1. Install the SDK</p>
                <StyledCodeBlock>{installCommand}</StyledCodeBlock>
                <p>2. Initialize the SDK</p>
                <StyledCodeBlock>
                    {codeSnippet
                        .replace('<YOUR_API_TOKEN>', apiKey)
                        .replace('<YOUR_API_URL>', apiUrl)}
                </StyledCodeBlock>
            </Box>
        </SpacedContainer>
    );
};
