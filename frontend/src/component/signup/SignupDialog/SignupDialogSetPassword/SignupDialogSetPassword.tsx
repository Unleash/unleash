import { styled } from '@mui/material';
import PasswordField from 'component/common/PasswordField/PasswordField.tsx';
import {
    StyledSignupDialogButton,
    StyledSignupDialogField,
    StyledSignupDialogLabel,
    type SignupStepContent,
} from '../SignupDialog.tsx';
import { Badge } from 'component/common/Badge/Badge.tsx';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { SignupDialogSetPasswordChecker } from './SignupDialogSetPasswordChecker.tsx';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser.ts';

const StyledBadge = styled(Badge)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1),
    '& span:last-child': {
        width: '100%',
    },
    '& input': {
        padding: 0,
        fontSize: theme.typography.body1.fontSize,
        lineHeight: 1.1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        width: '100%',
        color: 'inherit',
        marginLeft: theme.spacing(0.5),
    },
}));

export const SignupDialogSetPassword: SignupStepContent = ({
    data,
    setData,
    onNext,
}) => {
    const { user } = useAuthUser();
    const [isValidPassword, setIsValidPassword] = useState(false);
    const emailOrUsername = user?.email || user?.username;

    return (
        <>
            {emailOrUsername && (
                <StyledSignupDialogField>
                    <StyledSignupDialogLabel>
                        {user.email ? 'Verified email' : 'Username'}
                    </StyledSignupDialogLabel>
                    <StyledBadge color='success' icon={<CheckCircle />}>
                        <input
                            type={user.email ? 'email' : 'text'}
                            id={user.email ? 'email' : 'username'}
                            name={user.email ? 'email' : 'username'}
                            autoComplete={user.email ? 'email' : 'username'}
                            value={emailOrUsername}
                            readOnly
                            tabIndex={-1}
                        />
                    </StyledBadge>
                </StyledSignupDialogField>
            )}
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>Password</StyledSignupDialogLabel>
                <PasswordField
                    id='password'
                    placeholder='Your password'
                    autoComplete='new-password'
                    fullWidth
                    value={data.password}
                    onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            password: e.target.value,
                        }));
                    }}
                />
            </StyledSignupDialogField>
            <SignupDialogSetPasswordChecker
                password={data.password}
                setIsValidPassword={setIsValidPassword}
            />
            <StyledSignupDialogButton
                variant='contained'
                onClick={onNext}
                disabled={!isValidPassword}
            >
                Next
            </StyledSignupDialogButton>
        </>
    );
};
