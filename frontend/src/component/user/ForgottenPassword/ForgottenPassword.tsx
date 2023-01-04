import { Button, styled, TextField, Typography } from '@mui/material';
import { AlertTitle, Alert } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import useLoading from 'hooks/useLoading';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import { formatApiPath } from 'utils/formatPath';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import DividerText from 'component/common/DividerText/DividerText';
import StandaloneLayout from '../common/StandaloneLayout';
import {
    contentSpacingY,
    flexColumn,
    textCenter,
    title,
} from 'themes/themeStyles';

const StyledDiv = styled('div')(({ theme }) => ({
    ...contentSpacingY,
    ...flexColumn,
    width: '350px',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const StyledStrong = styled('strong')(({ theme }) => ({
    display: 'block',
    margin: theme.spacing(1, 0),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '150px',
    margin: theme.spacing(2, 'auto'),
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    ...title(theme),
    ...textCenter,
}));

const StyledForm = styled('form')(({ theme }) => ({
    ...contentSpacingY(theme),
    ...flexColumn,
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    ...textCenter,
}));

const ForgottenPassword = () => {
    const [email, setEmail] = useState('');
    const [attempted, setAttempted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attemptedEmail, setAttemptedEmail] = useState('');
    const ref = useLoading(loading);

    const onClick = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setAttemptedEmail(email);

        const path = formatApiPath('auth/reset/password-email');
        await fetch(path, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        setAttempted(true);
        setLoading(false);
    };

    return (
        <StandaloneLayout>
            <StyledDiv ref={ref}>
                <StyledTitle data-loading>Forgotten password</StyledTitle>
                <ConditionallyRender
                    condition={attempted}
                    show={
                        <Alert severity="success" data-loading>
                            <AlertTitle>Attempted to send email</AlertTitle>
                            We've attempted to send a reset password email to:
                            <StyledStrong>{attemptedEmail}</StyledStrong>
                            If you did not receive an email, please verify that
                            you typed in the correct email, and contact your
                            administrator to make sure that you are in the
                            system.
                        </Alert>
                    }
                />
                <StyledForm onSubmit={onClick}>
                    <StyledTypography variant="body1" data-loading>
                        Please provide your email address. If it exists in the
                        system we'll send a new reset link.
                    </StyledTypography>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="email"
                        type="email"
                        data-loading
                        data-testid={FORGOTTEN_PASSWORD_FIELD}
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                        }}
                    />
                    <StyledButton
                        variant="contained"
                        type="submit"
                        data-loading
                        color="primary"
                        disabled={loading}
                    >
                        <ConditionallyRender
                            condition={!attempted}
                            show={<span>Submit</span>}
                            elseShow={<span>Try again</span>}
                        />
                    </StyledButton>
                    <DividerText text="Or log in" />
                    <Button
                        type="submit"
                        data-loading
                        variant="outlined"
                        disabled={loading}
                        component={Link}
                        to="/login"
                        sx={theme => ({
                            width: '150px',
                            margin: theme.spacing(2, 'auto'),
                        })}
                    >
                        Log in
                    </Button>
                </StyledForm>
            </StyledDiv>
        </StandaloneLayout>
    );
};

export default ForgottenPassword;
