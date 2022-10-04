import { Button, styled } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import PasswordField from 'component/common/PasswordField/PasswordField';
import PasswordChecker, {
    PASSWORD_FORMAT_MESSAGE,
} from 'component/user/common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import PasswordMatcher from 'component/user/common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import { usePasswordApi } from 'hooks/api/actions/usePasswordApi/usePasswordApi';
import useToast from 'hooks/useToast';
import { SyntheticEvent, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    maxWidth: theme.spacing(44),
}));

export const PasswordTab = () => {
    const [loading, setLoading] = useState(false);
    const { setToastData, setToastApiError } = useToast();
    const [validPassword, setValidPassword] = useState(false);
    const [error, setError] = useState<string>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { changePassword } = usePasswordApi();

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
                await changePassword({
                    password,
                    confirmPassword,
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
        <PageContent isLoading={loading} header="Change password">
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
        </PageContent>
    );
};
