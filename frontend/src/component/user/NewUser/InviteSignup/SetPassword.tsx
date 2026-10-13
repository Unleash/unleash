import { type FormEvent, useState } from 'react';
import { IconButton, InputAdornment, styled } from '@mui/material';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircle from '@mui/icons-material/CheckCircle';
import {
    StyledField,
    StyledForm,
    StyledHeader,
    StyledInput,
    StyledLabel,
    StyledPrimaryButton,
    StyledSubtitle,
    StyledTitle,
} from './inviteSignupStyles.ts';

export const passwordRules = [
    {
        label: 'Minimum 10 characters',
        test: (password: string) => password.length >= 10,
    },
    {
        label: 'Contains a number',
        test: (password: string) => /\d/.test(password),
    },
    {
        label: 'Contains special characters',
        test: (password: string) => /[^A-Za-z0-9]/.test(password),
    },
    {
        label: 'Contains different cases',
        test: (password: string) =>
            /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
];

const StyledRules = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledRule = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    lineHeight: '20px',
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: 20,
    },
}));

const StyledVisibilityButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface ISetPasswordProps {
    email: string;
    requireName: boolean;
    loading: boolean;
    onSubmit: (details: { name: string; password: string }) => void;
}

export const SetPassword = ({
    email,
    requireName,
    loading,
    onSubmit,
}: ISetPasswordProps) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const passwordValid = passwordRules.every(({ test }) => test(password));
    const submittable =
        passwordValid && (!requireName || name.trim().length > 0) && !loading;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (submittable) {
            onSubmit({ name: name.trim(), password });
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
                        onChange={(e) => setName(e.target.value)}
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

            <StyledRules aria-label='Password requirements'>
                {passwordRules.map(({ label, test }) => {
                    const met = test(password);
                    return (
                        <StyledRule key={label} data-met={met}>
                            {met ? (
                                <CheckCircle color='success' aria-hidden />
                            ) : (
                                <RadioButtonUnchecked aria-hidden />
                            )}
                            {label}
                        </StyledRule>
                    );
                })}
            </StyledRules>

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
