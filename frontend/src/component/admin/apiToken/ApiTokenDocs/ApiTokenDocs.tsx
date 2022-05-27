import { Alert } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const ApiTokenDocs = () => {
    const { uiConfig } = useUiConfig();

    return (
        <Alert severity="info">
            <p>
                Read the{' '}
                <a
                    href="https://docs.getunleash.io/docs"
                    target="_blank"
                    rel="noreferrer"
                >
                    Getting started guide
                </a>{' '}
                to learn how to connect to the Unleash API from your application
                or programmatically. Please note it can take up to 1 minute
                before a new API key is activated.
            </p>
            <br />
            <strong>API URL: </strong>{' '}
            <pre style={{ display: 'inline' }}>{uiConfig.unleashUrl}/api/</pre>
        </Alert>
    );
};
