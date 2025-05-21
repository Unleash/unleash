import { Alert } from '@mui/material';

export const CdnHelpAlert = () => {
    return (
        <Alert severity='info'>
            <p>
                Use this page to configure which Frontend API tokens should be
                available on the CDN.
            </p>
            <p>
                Only tokens of type "FRONTEND" can be made available on the CDN.
                This ensures that client-side applications can use these tokens
                to fetch flag configurations.
            </p>
            <p>
                Selected tokens will be automatically made available through the
                CDN, allowing improved performance and reduced latency for
                client-side applications.
            </p>
        </Alert>
    );
};
