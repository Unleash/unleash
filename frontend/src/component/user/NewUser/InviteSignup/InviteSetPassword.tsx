import { useState } from 'react';
import { useNavigate } from 'react-router';
import useToast from 'hooks/useToast';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { useUserInvite } from 'hooks/api/getters/useUserInvite/useUserInvite';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import { useInviteTokenApi } from 'hooks/api/actions/useInviteTokenApi/useInviteTokenApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { initialSignupData } from 'component/signup/SignupDialog/SignupDialog.tsx';
import { SignupDialogLayout } from 'component/signup/SignupDialog/SignupDialogLayout.tsx';
import { SignupDialogSetPassword } from 'component/signup/SignupDialog/SignupDialogSetPassword/SignupDialogSetPassword.tsx';

interface IInviteSetPasswordProps {
    email: string;
}

export const InviteSetPassword = ({ email }: IInviteSetPasswordProps) => {
    const navigate = useNavigate();
    const { setToastApiError } = useToast();
    const { authDetails } = useAuthDetails();
    const { refetchUser } = useAuthUser();
    const { token } = useResetPassword();
    const { secret, isValid: isValidInvite } = useUserInvite();
    const { passwordAuth } = useAuthApi();
    const { resetPassword } = useAuthResetPasswordApi();
    const { addUser } = useInviteTokenApi();
    const [data, setData] = useState(initialSignupData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setPassword = (password: string) =>
        isValidInvite
            ? addUser(secret, { name: email.split('@')[0], email, password })
            : resetPassword({ token, password });

    const onNext = async () => {
        setIsSubmitting(true);
        try {
            await setPassword(data.password);
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setIsSubmitting(false);
            return;
        }

        try {
            await passwordAuth(authDetails?.path ?? '', email, data.password);
            refetchUser();
            navigate('/', { replace: true });
        } catch {
            navigate('/login?invited=true', { replace: true });
        }
    };

    return (
        <SignupDialogLayout
            hearts={1}
            title='Set password'
            description={`Create a secure password, and you're good to go!`}
        >
            <SignupDialogSetPassword
                data={data}
                setData={setData}
                onNext={onNext}
                isSubmitting={isSubmitting}
                email={email}
                submitLabel='Customize Unleash'
            />
        </SignupDialogLayout>
    );
};
