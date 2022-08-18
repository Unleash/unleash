import { Alert } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const ApiTokenDocs = () => {
    const { uiConfig } = useUiConfig();

    return (
        <Alert severity="info">
            <p>
                Read the{' '}
                <a
                    href="https://docs.getunleash.io/sdks"
                    target="_blank"
                    rel="noreferrer"
                >
                    SDK overview
                </a>{' '}
                to connect Unleash to your application. Please note it can take
                up to <strong>1 minute</strong> before a new API key is
                activated.
            </p>
            <br />
            <strong>API URL: </strong>{' '}
            <pre style={{ display: 'inline' }}>{uiConfig.unleashUrl}/api/</pre>
        </Alert>
    );
};
