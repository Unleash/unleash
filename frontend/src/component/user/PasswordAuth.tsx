import { type FormEventHandler, useState, type FC } from 'react';
import { Button, styled } from '@mui/material';
import { StyledAutofillTextField } from './StyledAutofillTextField.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useNavigate } from 'react-router';
import useQueryParams from 'hooks/useQueryParams';
import AuthOptions from './common/AuthOptions/AuthOptions.tsx';
import OrDivider from './common/OrDivider';
import { Alert } from '@mui/material';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID, LOGIN_PASSWORD_ID } from 'utils/testIds';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { FormField } from 'component/common/FormField/FormField';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import type { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import {
    AuthenticationError,
    BadRequestError,
    NotFoundError,
} from 'utils/apiUtils';
import useToast from 'hooks/useToast';

interface IPasswordAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
    redirect: string;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    color: theme.palette.error.main,
    marginBottom: theme.spacing(1),
}));

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

// Login fields use FormField (static top labels). FormField brings its own
// bottom margin, so zero it here and let the column gap own the spacing.
const StyledFields = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    '&& > *': {
        marginBottom: 0,
    },
}));

const StyledButton = styled(Button)({
    width: '100%',
});

const PasswordAuth: FC<IPasswordAuthProps> = ({ authDetails, redirect }) => {
    const navigate = useNavigate();
    const { refetchUser } = useAuthUser();
    const params = useQueryParams();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const { passwordAuth } = useAuthApi();
    const [errors, setErrors] = useState<{
        usernameError?: string;
        passwordError?: string;
        apiError?: string;
    }>({});
    const { setToastData } = useToast();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (evt) => {
        evt.preventDefault();

        if (!username) {
            setErrors((prev) => ({
                ...prev,
                usernameError: 'This is a required field',
            }));
        }
        if (!password) {
            setErrors((prev) => ({
                ...prev,
                passwordError: 'This is a required field',
            }));
        }

        if (!password || !username) {
            return;
        }

        try {
            const data = await passwordAuth(
                authDetails.path,
                username,
                password,
            );
            if (data.deletedSessions && data.activeSessions) {
                setToastData({
                    type: 'success',
                    text: `Maximum session limit of ${data.activeSessions} reached`,
                });
            }

            refetchUser();
            navigate(redirect, { replace: true });
        } catch (error: any) {
            if (
                error instanceof NotFoundError ||
                error instanceof BadRequestError
            ) {
                setErrors((prev) => ({
                    ...prev,
                    apiError: 'Invalid login details',
                }));
                setPassword('');
                setUsername('');
            } else if (error instanceof AuthenticationError) {
                setErrors({
                    apiError: 'Invalid password and username combination.',
                });
            } else {
                setErrors({
                    apiError: 'Unknown error while trying to authenticate.',
                });
            }
        }
    };

    const renderLoginForm = () => {
        const { usernameError, passwordError, apiError } = errors;

        return (
            <ConditionallyRender
                condition={!authDetails.defaultHidden}
                show={
                    <form onSubmit={handleSubmit}>
                        <ConditionallyRender
                            condition={Boolean(apiError)}
                            show={
                                <StyledAlert severity='error'>
                                    {apiError}
                                </StyledAlert>
                            }
                        />

                        <StyledFields>
                            <FormField label='Email'>
                                <StyledAutofillTextField
                                    label=''
                                    fullWidth
                                    name='username'
                                    id='username'
                                    type='text'
                                    onChange={(evt) =>
                                        setUsername(evt.target.value)
                                    }
                                    value={username}
                                    error={Boolean(usernameError)}
                                    helperText={usernameError}
                                    autoComplete='username'
                                    data-testid={LOGIN_EMAIL_ID}
                                    variant='outlined'
                                    size='large'
                                    autoFocus
                                />
                            </FormField>
                            <FormField label='Password'>
                                <PasswordField
                                    label=''
                                    fullWidth
                                    onChange={(evt) =>
                                        setPassword(evt.target.value)
                                    }
                                    name='password'
                                    id='password'
                                    value={password}
                                    error={Boolean(passwordError)}
                                    helperText={passwordError}
                                    autoComplete='off'
                                    data-testid={LOGIN_PASSWORD_ID}
                                />
                            </FormField>
                            <StyledButton
                                variant='contained'
                                color='primary'
                                type='submit'
                                data-testid={LOGIN_BUTTON}
                            >
                                Sign in
                            </StyledButton>
                        </StyledFields>
                    </form>
                }
            />
        );
    };

    const { options = [] } = authDetails;

    return (
        <>
            <ConditionallyRender
                condition={options.length > 0}
                show={
                    <StyledDiv>
                        <AuthOptions options={options} />
                        <ConditionallyRender
                            condition={!authDetails.defaultHidden}
                            show={<OrDivider />}
                        />
                        {renderLoginForm()}
                    </StyledDiv>
                }
                elseShow={renderLoginForm()}
            />
        </>
    );
};

export default PasswordAuth;
