import { type FormEvent, useState } from 'react';
import {
    Button,
    IconButton,
    InputAdornment,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ResetPasswordError from '../../common/ResetPasswordError/ResetPasswordError.tsx';
import { PasswordRequirementsChecker } from '../../common/PasswordRequirementsChecker/PasswordRequirementsChecker.tsx';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    wordBreak: 'break-word',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    lineHeight: '20px',
    color: theme.palette.text.secondary,
}));

const StyledField = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledLabel = styled('label')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '22px',
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    '&&& .MuiOutlinedInput-root': {
        height: 52,
        fontWeight: theme.typography.fontWeightMedium,
    },
    '& .MuiOutlinedInput-root.Mui-readOnly': {
        backgroundColor: theme.palette.background.elevation1,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.neutral.containerBorder,
    },
}));

const StyledVisibilityButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledPrimaryButton = styled(Button)(({ theme }) => ({
    height: 40,
    fontWeight: theme.typography.fontWeightBold,
}));

interface ISetPasswordProps {
    email: string;
    name: string;
    onNameChange: (name: string) => void;
    requireName: boolean;
    loading: boolean;
    apiError: string;
    onSubmit: (password: string) => void;
}

export const SetPassword = ({
    email,
    name,
    onNameChange,
    requireName,
    loading,
    apiError,
    onSubmit,
}: ISetPasswordProps) => {
    const [password, setPassword] = useState('');
    const [isValidPassword, setIsValidPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const submittable =
        isValidPassword && (!requireName || name.trim().length > 0) && !loading;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (submittable) {
            onSubmit(password);
        }
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledHeader>
                <StyledTitle variant='h1'>Set password</StyledTitle>
                <StyledSubtitle>
                    Create a secure password, and you’re good to go!
                </StyledSubtitle>
            </StyledHeader>

            <ResetPasswordError>{apiError}</ResetPasswordError>

            <StyledField>
                <StyledLabel htmlFor='set-password-email'>Email</StyledLabel>
                <StyledInput
                    id='set-password-email'
                    type='email'
                    autoComplete='username'
                    fullWidth
                    value={email}
                    slotProps={{ input: { readOnly: true } }}
                />
            </StyledField>

            {requireName ? (
                <StyledField>
                    <StyledLabel htmlFor='set-password-name'>
                        Full name
                    </StyledLabel>
                    <StyledInput
                        id='set-password-name'
                        placeholder='Your name'
                        autoComplete='name'
                        fullWidth
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                    />
                </StyledField>
            ) : null}

            <StyledField>
                <StyledLabel htmlFor='set-password-password'>
                    Password
                </StyledLabel>
                <StyledInput
                    id='set-password-password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Your password'
                    autoComplete='new-password'
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <StyledVisibilityButton
                                        edge='end'
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <VisibilityOutlined />
                                        ) : (
                                            <VisibilityOffOutlined />
                                        )}
                                    </StyledVisibilityButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </StyledField>

            <PasswordRequirementsChecker
                password={password}
                setIsValidPassword={setIsValidPassword}
            />

            <StyledPrimaryButton
                type='submit'
                variant='contained'
                fullWidth
                disabled={!submittable}
            >
                Customize Unleash
            </StyledPrimaryButton>
        </StyledForm>
    );
};
