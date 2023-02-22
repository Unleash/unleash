import React from 'react';
import { Alert } from '@mui/material';

export const CorsHelpAlert = () => {
    return (
        <Alert severity="info">
            <p>
                Use this page to configure allowed CORS origins for the Frontend
                API (<code>/api/frontend</code>).
            </p>
            <p>
                This configuration will not affect the Admin API (
                <code>/api/admin</code>) nor the Client API (
                <code>/api/client</code>).
            </p>
            <p>
                An asterisk (<code>*</code>) may be used to allow API calls from
                any origin.
            </p>
            <br />
            <p>
                Be aware that changes here will take up to two minutes to be
                updated. In addition, there is a maxAge on the
                Access-Control-Allow-Origin header that will instruct browsers
                to cache this header for some time. The cache period is set to
                the maxium that the browser allows (2h for Chrome, 24h for
                Firefox).
            </p>
        </Alert>
    );
};
