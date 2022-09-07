import { Alert } from '@mui/material';

export const AdminAlert = () => {
    return (
        <Alert severity="error">
            You need instance admin to access this section.
        </Alert>
    );
};
