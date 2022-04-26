import { Alert } from '@material-ui/lab';

export const AdminAlert = () => {
    return (
        <Alert severity="error">
            You need instance admin to access this section.
        </Alert>
    );
};
