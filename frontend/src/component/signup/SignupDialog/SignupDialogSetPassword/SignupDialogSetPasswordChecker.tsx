import { styled } from '@mui/material';
import { BAD_REQUEST, OK } from 'constants/statusCodes';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { formatApiPath } from 'utils/formatPath';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const StyledRequirementIcon = styled(RadioButtonUncheckedIcon)(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: '1.25rem',
}));

const StyledRequirementOkIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: '1.25rem',
}));

const StyledList = styled('ul')(({ theme }) => ({
    margin: 0,
    padding: 0,
    listStyle: 'none',
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    '& li': {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        ':not(:last-child)': {
            marginBottom: theme.spacing(1),
        },
    },
}));

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

interface IErrorResponse {
    details: { validationErrors: string[] }[];
}

type RequirementKey = 'length' | 'casing' | 'number' | 'symbol' | 'repeating';

type PasswordErrors = Record<RequirementKey, boolean>;

const ALL_TRUE: PasswordErrors = {
    length: true,
    casing: true,
    number: true,
    symbol: true,
    repeating: true,
};

const ALL_FALSE: PasswordErrors = {
    length: false,
    casing: false,
    number: false,
    symbol: false,
    repeating: false,
};

const RequirementIcon = ({ ok }: { ok: boolean }) =>
    ok ? <StyledRequirementOkIcon /> : <StyledRequirementIcon />;

type Requirement = {
    key: RequirementKey;
    label: string;
    test: (password: string) => boolean;
    serverErrors: readonly string[];
};

const REQUIREMENTS: Requirement[] = [
    {
        key: 'length',
        label: 'Minimum 10 characters',
        test: (p: string) => p.length >= 10,
        serverErrors: [LENGTH_ERROR],
    },
    {
        key: 'casing',
        label: 'Uppercase and lowercase letters',
        test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
        serverErrors: [LOWERCASE_ERROR, UPPERCASE_ERROR],
    },
    {
        key: 'number',
        label: 'One or more numbers',
        test: (p: string) => /\d/.test(p),
        serverErrors: [NUMBER_ERROR],
    },
    {
        key: 'symbol',
        label: 'One or more symbols',
        test: (p: string) => /[^A-Za-z0-9]/.test(p),
        serverErrors: [SYMBOL_ERROR],
    },
    {
        key: 'repeating',
        label: 'No character repeated 3 times in a row',
        test: (p: string) => !/(.)\1\1/.test(p),
        serverErrors: [REPEATING_CHARACTER_ERROR],
    },
];

const validateLocally = (password: string): PasswordErrors =>
    REQUIREMENTS.reduce<PasswordErrors>(
        (acc, r) => {
            acc[r.key] = !r.test(password);
            return acc;
        },
        { ...ALL_FALSE },
    );

const errorsFromServer = (validationErrors: string[]): PasswordErrors => {
    const set = new Set(validationErrors);
    return REQUIREMENTS.reduce<PasswordErrors>(
        (acc, r) => {
            acc[r.key] = r.serverErrors.some((msg) => set.has(msg));
            return acc;
        },
        { ...ALL_FALSE },
    );
};

const getUnmappedServerErrors = (validationErrors: string[]) => {
    const known = new Set(REQUIREMENTS.flatMap((r) => r.serverErrors));
    return validationErrors.filter((msg) => !known.has(msg));
};

interface ISignupDialogSetPasswordCheckerProps {
    password: string;
    setIsValidPassword: Dispatch<SetStateAction<boolean>>;
}

export const SignupDialogSetPasswordChecker = ({
    password,
    setIsValidPassword,
}: ISignupDialogSetPasswordCheckerProps) => {
    const [errors, setErrors] = useState<PasswordErrors>(ALL_TRUE);
    const [serverExtraErrors, setServerExtraErrors] = useState<string[]>([]);

    useEffect(() => {
        const validate = async () => {
            if (!password) {
                setErrors(ALL_TRUE);
                setServerExtraErrors([]);
                setIsValidPassword(false);
                return;
            }

            const localErrors = validateLocally(password);
            setErrors(localErrors);

            const passesLocal = Object.values(localErrors).every((e) => !e);
            if (!passesLocal) {
                setIsValidPassword(false);
                return;
            }

            try {
                const res = await fetch(
                    formatApiPath('auth/reset/validate-password'),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({ password }),
                    },
                );

                if (res.status === OK) {
                    setErrors(ALL_FALSE);
                    setServerExtraErrors([]);
                    setIsValidPassword(true);
                    return;
                }

                if (res.status === BAD_REQUEST) {
                    const data = (await res.json()) as IErrorResponse;
                    const validationErrors =
                        data.details?.[0]?.validationErrors ?? [];
                    setErrors(errorsFromServer(validationErrors));
                    setServerExtraErrors(
                        getUnmappedServerErrors(validationErrors),
                    );
                    setIsValidPassword(false);
                }
            } catch {
                setIsValidPassword(false);
            }
        };

        validate();
    }, [password, setIsValidPassword]);

    return (
        <StyledList>
            {REQUIREMENTS.map(({ key, label }) => {
                const ok = !errors[key];
                return (
                    <li key={key}>
                        <RequirementIcon ok={ok} />
                        {label}
                    </li>
                );
            })}
            {serverExtraErrors.map((msg) => (
                <li key={msg}>
                    <StyledRequirementIcon />
                    {msg}
                </li>
            ))}
        </StyledList>
    );
};
