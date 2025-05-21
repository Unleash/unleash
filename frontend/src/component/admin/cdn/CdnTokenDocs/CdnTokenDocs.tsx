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

export const CdnTokenDocs = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData } = useToast();

    const onCopyToClipboard = (url: string) => () => {
        copy(url);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    const clientApiUrl = `https://cdn.getunleash.io/api/`; // TODO: docs
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;

    return (
        <Alert severity='info'>
            <p>Low-latency content delivery network (experimental).</p>
            <GridContainer>
                <GridItem>
                    <strong>CDN API URL: </strong>
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
                    <strong>METRICS API URL: </strong>
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
