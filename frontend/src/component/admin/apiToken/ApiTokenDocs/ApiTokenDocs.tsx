import { Alert, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ApiUrl } from './ApiUrl/ApiUrl';

const GridContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr',
    gridAutoRows: 'min-content',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
}));

export const ApiTokenDocs = () => {
    const { uiConfig } = useUiConfig();

    const edgeUrls = uiConfig.edgeUrl
        ? {
              edgeUrl: `${uiConfig.edgeUrl}/api/`,
              edgeFrontendUrl: `${uiConfig.edgeUrl}/api/frontend/`,
          }
        : undefined;

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;

    return (
        <Alert severity='info'>
            <p>
                Read the{' '}
                <a
                    href='https://docs.getunleash.io/sdks'
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
                {edgeUrls && (
                    <>
                        <ApiUrl title='EDGE API URL:' url={edgeUrls.edgeUrl} />
                        <ApiUrl
                            title='EDGE FRONTEND API URL:'
                            url={edgeUrls.edgeFrontendUrl}
                        />
                    </>
                )}

                <ApiUrl title='CLIENT API URL:' url={clientApiUrl} />
                <ApiUrl title='FRONTEND API URL:' url={frontendApiUrl} />
            </GridContainer>
        </Alert>
    );
};
