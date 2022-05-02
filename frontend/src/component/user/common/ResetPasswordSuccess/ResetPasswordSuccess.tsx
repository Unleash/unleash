import { Alert, AlertTitle } from '@mui/material';

const ResetPasswordSuccess = () => {
    return (
        <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            You successfully reset your password.
        </Alert>
    );
};

export default ResetPasswordSuccess;
