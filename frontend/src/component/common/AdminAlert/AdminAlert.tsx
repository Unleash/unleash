import React from 'react';
import Alert from '@mui/material/Alert';

export const AdminAlert = React.memo(() => {
    return (
        <Alert severity="error">
            You need instance admin to access this section.
        </Alert>
    );
});
