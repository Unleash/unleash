import { Typography } from '@mui/material';
import classnames from 'classnames';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BAD_REQUEST, OK } from 'constants/statusCodes';
import { useStyles } from './PasswordChecker.styles';
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

const PasswordChecker = ({
    password,
    callback,
    style = {},
}: IPasswordCheckerProps) => {
    const { classes: styles } = useStyles();
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

    const lengthStatusBarClasses = classnames(styles.statusBar, {
        [styles.statusBarSuccess]: !lengthError,
    });

    const numberStatusBarClasses = classnames(styles.statusBar, {
        [styles.statusBarSuccess]: !numberError,
    });

    const symbolStatusBarClasses = classnames(styles.statusBar, {
        [styles.statusBarSuccess]: !symbolError,
    });

    const casingStatusBarClasses = classnames(styles.statusBar, {
        [styles.statusBarSuccess]: !casingError,
    });

    return (
        <>
            <Typography variant="body2" className={styles.title} data-loading>
                Please set a strong password
                <HelpIcon tooltip={PASSWORD_FORMAT_MESSAGE} />
            </Typography>
            <div
                className={styles.container}
                style={{
                    ...style,
                }}
            >
                <div className={styles.headerContainer}>
                    <div className={styles.checkContainer}>
                        <Typography variant="body2" data-loading>
                            Length
                        </Typography>
                    </div>
                    <div className={styles.checkContainer}>
                        <Typography variant="body2" data-loading>
                            Casing
                        </Typography>
                    </div>
                    <div className={styles.checkContainer}>
                        <Typography variant="body2" data-loading>
                            Number
                        </Typography>
                    </div>
                    <div className={styles.checkContainer}>
                        <Typography variant="body2" data-loading>
                            Symbol
                        </Typography>
                    </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.statusBarContainer}>
                    <div className={styles.checkContainer}>
                        <div className={lengthStatusBarClasses} data-loading />
                    </div>
                    <div className={styles.checkContainer}>
                        <div className={casingStatusBarClasses} data-loading />
                    </div>{' '}
                    <div className={styles.checkContainer}>
                        <div className={numberStatusBarClasses} data-loading />
                    </div>
                    <div className={styles.checkContainer}>
                        <div className={symbolStatusBarClasses} data-loading />
                    </div>
                </div>
                <ConditionallyRender
                    condition={repeatingCharError}
                    show={
                        <Alert
                            severity="error"
                            className={styles.repeatingError}
                        >
                            You may not repeat three characters in a row.
                        </Alert>
                    }
                />
            </div>
        </>
    );
};

export default PasswordChecker;
