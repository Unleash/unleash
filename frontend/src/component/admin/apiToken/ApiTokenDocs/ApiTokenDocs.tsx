import { Alert, Box, IconButton, styled, Tooltip } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

const GridContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr',
    gridAutoRows: 'min-content',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
}));
const GridItem = Box;

export const ApiTokenDocs = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData } = useToast();

    const onCopyToClipboard = (url: string) => () => {
        copy(url);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;

    return (
        <Alert severity='info'>
            <p>
                Read the{' '}
                <a
                    href='https://docs.getunleash.io/concepts/sdks'
                    target='_blank'
                    rel='noreferrer'
                >
                    SDK overview
                </a>{' '}
                to connect Unleash to your application. Please note it can take
                up to <strong>1 minute</strong> before a new API key is
                activated.
            </p>
            <GridContainer>
                <GridItem>
                    <strong>CLIENT API URL: </strong>
                </GridItem>
                <GridItem>
                    <pre style={{ display: 'inline' }}>{clientApiUrl}</pre>
                </GridItem>
                <GridItem>
                    <Tooltip title='Copy URL' arrow>
                        <IconButton
                            onClick={onCopyToClipboard(clientApiUrl)}
                            size='small'
                        >
                            <CopyIcon />
                        </IconButton>
                    </Tooltip>
                </GridItem>
                <GridItem>
                    <strong>FRONTEND API URL: </strong>
                </GridItem>
                <GridItem>
                    <pre style={{ display: 'inline' }}>{frontendApiUrl}</pre>
                </GridItem>
                <GridItem>
                    <Tooltip title='Copy URL' arrow>
                        <IconButton
                            onClick={onCopyToClipboard(frontendApiUrl)}
                            size='small'
                        >
                            <CopyIcon />
                        </IconButton>
                    </Tooltip>
                </GridItem>
            </GridContainer>
        </Alert>
    );
};
