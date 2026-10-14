import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CREATED, OK } from 'constants/statusCodes';
import useToast from 'hooks/useToast';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { useUserInvite } from 'hooks/api/getters/useUserInvite/useUserInvite';
import { useInviteTokenApi } from 'hooks/api/actions/useInviteTokenApi/useInviteTokenApi';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import { formatUnknownError } from 'utils/formatUnknownError';

interface INewUserDetails {
    name: string;
    email: string;
    password: string;
}

export const useNewUserSubmit = () => {
    const { setToastApiError } = useToast();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const { token } = useResetPassword();
    const { secret, isValid: isValidInvite } = useUserInvite();
    const { addUser, loading: isUserSubmitting } = useInviteTokenApi();
    const { resetPassword, loading: isPasswordSubmitting } =
        useAuthResetPasswordApi();

    const onSubmitInvitedUser = async ({
        name,
        email,
        password,
    }: INewUserDetails) => {
        try {
            const res = await addUser(secret, { name, email, password });
            if (res.status === CREATED) {
                navigate('/login?invited=true');
            } else {
                setToastApiError(
                    "Couldn't create user. Check if your invite link is valid.",
                );
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onSubmitPasswordReset = async ({ password }: INewUserDetails) => {
        try {
            const res = await resetPassword({ token, password });
            if (res.status === OK) {
                navigate('/login?reset=true');
            } else {
                setApiError(
                    'Something went wrong when attempting to update your password. This could be due to unstable internet connectivity. If retrying the request does not work, please try again later.',
                );
            }
        } catch (e) {
            const error = formatUnknownError(e);
            setApiError(error);
        }
    };

    const onSubmit = (details: INewUserDetails) => {
        if (isValidInvite) {
            onSubmitInvitedUser(details);
        } else {
            onSubmitPasswordReset(details);
        }
    };

    return {
        onSubmit,
        apiError,
        loading: isUserSubmitting || isPasswordSubmitting,
    };
};
