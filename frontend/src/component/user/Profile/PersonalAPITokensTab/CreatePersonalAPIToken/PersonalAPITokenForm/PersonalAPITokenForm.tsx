import Input from 'component/common/Input/Input';
import SelectMenu from 'component/common/select';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DateTimePicker } from 'component/common/DateTimePicker/DateTimePicker';
import { Alert, styled, Typography } from '@mui/material';
import { useEffect } from 'react';

const StyledInputDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    marginBottom: theme.spacing(2),
}));

const StyledExpirationPicker = styled('div')<{ custom?: boolean }>(
    ({ theme, custom }) => ({
        display: 'flex',
        alignItems: custom ? 'start' : 'center',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    })
);

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
    marginRight: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
        width: theme.spacing(50),
    },
}));

const StyledDateTimePicker = styled(DateTimePicker)(({ theme }) => ({
    width: theme.spacing(28),
    [theme.breakpoints.down('sm')]: {
        width: theme.spacing(50),
    },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    maxWidth: theme.spacing(50),
}));

export enum ExpirationOption {
    '7DAYS' = '7d',
    '30DAYS' = '30d',
    '60DAYS' = '60d',
    NEVER = 'never',
    CUSTOM = 'custom',
}

export const expirationOptions = [
    {
        key: ExpirationOption['7DAYS'],
        days: 7,
        label: '7 days',
    },
    {
        key: ExpirationOption['30DAYS'],
        days: 30,
        label: '30 days',
    },
    {
        key: ExpirationOption['60DAYS'],
        days: 60,
        label: '60 days',
    },
    {
        key: ExpirationOption.NEVER,
        label: 'Never',
    },
    {
        key: ExpirationOption.CUSTOM,
        label: 'Custom',
    },
];

export const calculateExpirationDate = (expiration: ExpirationOption) => {
    const expiresAt = new Date();
    const expirationOption = expirationOptions.find(
        ({ key }) => key === expiration
    );
    if (expiration === ExpirationOption.NEVER) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1000);
    } else if (expiration === ExpirationOption.CUSTOM) {
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    } else if (expirationOption?.days) {
        expiresAt.setDate(expiresAt.getDate() + expirationOption.days);
    }
    return expiresAt;
};

enum ErrorField {
    DESCRIPTION = 'description',
    EXPIRES_AT = 'expiresAt',
}

export interface IPersonalAPITokenFormErrors {
    [ErrorField.DESCRIPTION]?: string;
    [ErrorField.EXPIRES_AT]?: string;
}

interface IPersonalAPITokenFormProps {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    isDescriptionUnique?: (description: string) => boolean;
    expiration: ExpirationOption;
    setExpiration: (expiration: ExpirationOption) => void;
    expiresAt: Date;
    setExpiresAt: React.Dispatch<React.SetStateAction<Date>>;
    errors: IPersonalAPITokenFormErrors;
    setErrors: React.Dispatch<
        React.SetStateAction<IPersonalAPITokenFormErrors>
    >;
}

export const PersonalAPITokenForm = ({
    description,
    setDescription,
    isDescriptionUnique,
    expiration,
    setExpiration,
    expiresAt,
    setExpiresAt,
    errors,
    setErrors,
}: IPersonalAPITokenFormProps) => {
    const { locationSettings } = useLocationSettings();

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        clearError(ErrorField.EXPIRES_AT);
        setExpiresAt(calculateExpirationDate(expiration));
    }, [expiration]);

    const onSetDescription = (description: string) => {
        clearError(ErrorField.DESCRIPTION);
        if (isDescriptionUnique && !isDescriptionUnique(description)) {
            setError(
                ErrorField.DESCRIPTION,
                'A token with that description already exists.'
            );
        }
        setDescription(description);
    };

    const customExpiration = expiration === ExpirationOption.CUSTOM;

    const neverExpires =
        expiresAt.getFullYear() > new Date().getFullYear() + 100;

    return (
        <>
            <StyledInputDescription>
                Describe what this token will be used for
            </StyledInputDescription>
            <StyledInput
                autoFocus
                label="Description"
                error={Boolean(errors.description)}
                errorText={errors.description}
                value={description}
                onChange={e => onSetDescription(e.target.value)}
                required
            />
            <StyledInputDescription>
                Token expiration date
            </StyledInputDescription>
            <StyledExpirationPicker custom={customExpiration}>
                <StyledSelectMenu
                    name="expiration"
                    id="expiration"
                    label="Token will expire in"
                    value={expiration}
                    onChange={e =>
                        setExpiration(e.target.value as ExpirationOption)
                    }
                    options={expirationOptions}
                />
                <ConditionallyRender
                    condition={customExpiration}
                    show={() => (
                        <StyledDateTimePicker
                            label="Date"
                            value={expiresAt}
                            onChange={date => {
                                clearError(ErrorField.EXPIRES_AT);
                                if (date < new Date()) {
                                    setError(
                                        ErrorField.EXPIRES_AT,
                                        'Invalid date, must be in the future'
                                    );
                                }
                                setExpiresAt(date);
                            }}
                            min={new Date()}
                            error={Boolean(errors.expiresAt)}
                            errorText={errors.expiresAt}
                            required
                        />
                    )}
                    elseShow={
                        <ConditionallyRender
                            condition={neverExpires}
                            show={
                                <Typography variant="body2">
                                    The token will <strong>never</strong>{' '}
                                    expire!
                                </Typography>
                            }
                            elseShow={() => (
                                <Typography variant="body2">
                                    Token will expire on{' '}
                                    <strong>
                                        {formatDateYMD(
                                            expiresAt!,
                                            locationSettings.locale
                                        )}
                                    </strong>
                                </Typography>
                            )}
                        />
                    }
                />
            </StyledExpirationPicker>
            <ConditionallyRender
                condition={neverExpires}
                show={
                    <StyledAlert severity="warning">
                        We strongly recommend that you set an expiration date
                        for your token to help keep your information secure.
                    </StyledAlert>
                }
            />
        </>
    );
};
