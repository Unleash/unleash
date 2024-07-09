import { Alert, AlertTitle } from '@mui/material';

interface IResetPasswordErrorProps {
    children: string;
}

const ResetPasswordError = ({ children }: IResetPasswordErrorProps) => {
    if (!children) return null;

    return (
        <Alert severity='error' data-loading>
            <AlertTitle>Unable to reset password</AlertTitle>
            {children}
        </Alert>
    );
};

export default ResetPasswordError;
