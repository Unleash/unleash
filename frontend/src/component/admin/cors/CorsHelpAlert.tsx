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
        </Alert>
    );
};
