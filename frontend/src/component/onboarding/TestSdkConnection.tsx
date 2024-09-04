import type { FC } from 'react';
import { Box, IconButton, styled, Tooltip, Typography } from '@mui/material';
import { SectionHeader } from './SharedComponents';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { Sdk } from './sharedTypes';
import { codeSnippets, installCommands } from './sdkSnippets';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import CopyIcon from '@mui/icons-material/FileCopy';

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
    position: 'relative',
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
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
    const { setToastData } = useToast();

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;
    const apiUrl = sdk.type === 'client' ? clientApiUrl : frontendApiUrl;
    const codeSnippet =
        codeSnippets[sdk.name] || `No snippet found for the ${sdk.name} SDK`;
    const installCommand =
        installCommands[sdk.name] ||
        `No install command found for the ${sdk.name} SDK`;
    const filledCodeSnippet = codeSnippet
        .replace('<YOUR_API_TOKEN>', apiKey)
        .replace('<YOUR_API_URL>', apiUrl);

    const onCopyToClipboard = (data: string) => () => {
        copy(data);
        setToastData({
            type: 'success',
            title: 'Copied to clipboard',
        });
    };

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <Box sx={{ mt: 4 }}>
                <SectionHeader>Setup the SDK</SectionHeader>
                <p>1. Install the SDK</p>
                <StyledCodeBlock>
                    {installCommand}
                    <CopyToClipboard title='Copy command' arrow>
                        <IconButton
                            onClick={onCopyToClipboard(installCommand)}
                            size='small'
                        >
                            <CopyIcon />
                        </IconButton>
                    </CopyToClipboard>
                </StyledCodeBlock>
                <p>2. Initialize the SDK</p>
                <StyledCodeBlock>
                    {filledCodeSnippet}
                    <CopyToClipboard title='Copy snippet' arrow>
                        <IconButton
                            onClick={onCopyToClipboard(filledCodeSnippet)}
                            size='small'
                        >
                            <CopyIcon />
                        </IconButton>
                    </CopyToClipboard>
                </StyledCodeBlock>
            </Box>
        </SpacedContainer>
    );
};
