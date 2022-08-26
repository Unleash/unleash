import { Alert, AlertTitle } from '@mui/material';

const ResetPasswordError = () => {
    return (
        <Alert severity="error" data-loading>
            <AlertTitle>Unable to reset password</AlertTitle>
            Something went wrong when attempting to update your password. This
            could be due to unstable internet connectivity. If retrying the
            request does not work, please try again later.
        </Alert>
    );
};

export default ResetPasswordError;
