import { styled, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BAD_REQUEST, OK } from 'constants/statusCodes';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { Alert } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

interface IPasswordCheckerProps {
    password: string;
    callback: Dispatch<SetStateAction<boolean>>;
    style?: object;
    hideOnCompletion?: boolean;
}

interface IErrorResponse {
    details: IErrorDetails[];
}

interface IErrorDetails {
    message: string;
    validationErrors: string[];
}

const LENGTH_ERROR = 'The password must be at least 10 characters long.';
const NUMBER_ERROR = 'The password must contain at least one number.';
const SYMBOL_ERROR =
    'The password must contain at least one special character.';
const UPPERCASE_ERROR =
    'The password must contain at least one uppercase letter.';
const LOWERCASE_ERROR =
    'The password must contain at least one lowercase letter.';
const REPEATING_CHARACTER_ERROR =
    'The password may not contain sequences of three or more repeated characters.';
export const PASSWORD_FORMAT_MESSAGE =
    'The password must be at least 10 characters long and must include an uppercase letter, a lowercase letter, a number, and a symbol.';

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '1ch',
}));

const StyledContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    maxWidth: '350px',
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5, 0, 1.5),
}));

const StyledHeaderContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1),
}));

const StyledCheckContainer = styled('div')(({ theme }) => ({
    width: '95px',
    margin: theme.spacing(0, 0.5),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledDivider = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    height: '1px',
    width: '100%',
}));

const StyledStatusBarContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1),
}));

const StyledError = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
    bottom: '0',
    position: 'absolute',
}));

const StyledStatusBar = styled('div', {
    shouldForwardProp: prop => prop !== 'error',
})<{ error: boolean }>(({ theme, error }) => ({
    width: '50px',
    borderRadius: theme.shape.borderRadius,
    height: '6px',
    backgroundColor: error
        ? theme.palette.error.main
        : theme.palette.primary.main,
}));

const PasswordChecker = ({
    password,
    callback,
    style = {},
}: IPasswordCheckerProps) => {
    const [casingError, setCasingError] = useState(true);
    const [numberError, setNumberError] = useState(true);
    const [symbolError, setSymbolError] = useState(true);
    const [lengthError, setLengthError] = useState(true);
    const [repeatingCharError, setRepeatingCharError] = useState(false);

    const makeValidatePassReq = useCallback(() => {
        const path = formatApiPath('auth/reset/validate-password');
        return fetch(path, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    }, [password]);

    const clearCheckerErrors = useCallback(() => {
        setAllErrors(false);
    }, []);

    const checkPassword = useCallback(async () => {
        if (!password) {
            setAllErrors(true);
            return;
        }
        if (password.length < 3) {
            setLengthError(true);
            return;
        }
        try {
            const res = await makeValidatePassReq();
            if (res.status === BAD_REQUEST) {
                const data = await res.json();
                handleErrorResponse(data);
                callback(false);
            }

            if (res.status === OK) {
                clearCheckerErrors();
                setRepeatingCharError(false);
                callback(true);
            }
        } catch (e) {
            // ResetPasswordForm handles errors related to submitting the form.
            console.log('An exception was caught and handled');
        }
    }, [makeValidatePassReq, callback, password, clearCheckerErrors]);

    useEffect(() => {
        checkPassword();
    }, [password, checkPassword]);

    const setAllErrors = (flag: boolean) => {
        setCasingError(flag);
        setNumberError(flag);
        setSymbolError(flag);
        setLengthError(flag);
    };

    const handleErrorResponse = (data: IErrorResponse) => {
        const errors = data.details[0].validationErrors;

        if (errors.includes(NUMBER_ERROR)) {
            setNumberError(true);
        } else {
            setNumberError(false);
        }

        if (errors.includes(SYMBOL_ERROR)) {
            setSymbolError(true);
        } else {
            setSymbolError(false);
        }

        if (errors.includes(LENGTH_ERROR)) {
            setLengthError(true);
        } else {
            setLengthError(false);
        }

        if (
            errors.includes(LOWERCASE_ERROR) ||
            errors.includes(UPPERCASE_ERROR)
        ) {
            setCasingError(true);
        } else {
            setCasingError(false);
        }

        if (errors.includes(REPEATING_CHARACTER_ERROR)) {
            setRepeatingCharError(true);
        } else {
            setRepeatingCharError(false);
        }
    };

    return (
        <>
            <StyledTitle variant="body2" data-loading>
                Please set a strong password
                <HelpIcon tooltip={PASSWORD_FORMAT_MESSAGE} />
            </StyledTitle>
            <StyledContainer
                style={{
                    ...style,
                }}
            >
                <StyledHeaderContainer>
                    <StyledCheckContainer>
                        <Typography variant="body2" data-loading>
                            Length
                        </Typography>
                    </StyledCheckContainer>
                    <StyledCheckContainer>
                        <Typography variant="body2" data-loading>
                            Casing
                        </Typography>
                    </StyledCheckContainer>
                    <StyledCheckContainer>
                        <Typography variant="body2" data-loading>
                            Number
                        </Typography>
                    </StyledCheckContainer>
                    <StyledCheckContainer>
                        <Typography variant="body2" data-loading>
                            Symbol
                        </Typography>
                    </StyledCheckContainer>
                </StyledHeaderContainer>
                <StyledDivider />
                <StyledStatusBarContainer>
                    <StyledCheckContainer>
                        <StyledStatusBar error={lengthError} data-loading />
                    </StyledCheckContainer>
                    <StyledCheckContainer>
                        <StyledStatusBar error={casingError} data-loading />
                    </StyledCheckContainer>{' '}
                    <StyledCheckContainer>
                        <StyledStatusBar error={numberError} data-loading />
                    </StyledCheckContainer>
                    <StyledCheckContainer>
                        <StyledStatusBar error={symbolError} data-loading />
                    </StyledCheckContainer>
                </StyledStatusBarContainer>
                <ConditionallyRender
                    condition={repeatingCharError}
                    show={
                        <StyledError severity="error">
                            You may not repeat three characters in a row.
                        </StyledError>
                    }
                />
            </StyledContainer>
        </>
    );
};

export default PasswordChecker;
