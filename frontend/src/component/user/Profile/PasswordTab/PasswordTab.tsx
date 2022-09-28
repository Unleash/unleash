import { Button, styled, Typography } from '@mui/material';
import PasswordField from 'component/common/PasswordField/PasswordField';
import PasswordChecker, {
    PASSWORD_FORMAT_MESSAGE,
} from 'component/user/common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import PasswordMatcher from 'component/user/common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import useLoading from 'hooks/useLoading';
import useToast from 'hooks/useToast';
import { IUser } from 'interfaces/user';
import { SyntheticEvent, useState } from 'react';
import { headers } from 'utils/apiUtils';
import { formatApiPath } from 'utils/formatPath';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledSectionLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    maxWidth: theme.spacing(44),
}));

interface IPasswordTabProps {
    user: IUser;
}

export const PasswordTab = ({ user }: IPasswordTabProps) => {
    const [loading, setLoading] = useState(false);
    const { setToastData, setToastApiError } = useToast();
    const [validPassword, setValidPassword] = useState(false);
    const [error, setError] = useState<string>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const ref = useLoading(loading);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        } else if (!validPassword) {
            setError(PASSWORD_FORMAT_MESSAGE);
        } else {
            setLoading(true);
            setError(undefined);
            try {
                const path = formatApiPath('api/admin/user/change-password');
                await fetch(path, {
                    headers,
                    body: JSON.stringify({ password, confirmPassword }),
                    method: 'POST',
                    credentials: 'include',
                });
                setToastData({
                    title: 'Password changed successfully',
                    text: 'Now you can sign in using your new password.',
                    type: 'success',
                });
            } catch (error: unknown) {
                const formattedError = formatUnknownError(error);
                setError(formattedError);
                setToastApiError(formattedError);
            }
        }
        setLoading(false);
    };

    return (
        <StyledContent ref={ref}>
            <StyledSectionLabel>Change password</StyledSectionLabel>
            <StyledForm>
                <PasswordChecker
                    password={password}
                    callback={setValidPassword}
                    data-loading
                />
                <PasswordField
                    data-loading
                    label="Password"
                    name="password"
                    value={password}
                    error={Boolean(error)}
                    helperText={error}
                    autoComplete="new-password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                />
                <PasswordField
                    data-loading
                    label="Confirm password"
                    name="confirmPassword"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                    }
                />
                <PasswordMatcher
                    data-loading
                    started={Boolean(password && confirmPassword)}
                    matchingPasswords={password === confirmPassword}
                />
                <Button
                    data-loading
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={submit}
                >
                    Save
                </Button>
            </StyledForm>
        </StyledContent>
    );
};
