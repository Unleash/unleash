import { Alert, Button, styled, Typography } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FC, FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePersonalAPITokens } from 'hooks/api/getters/usePersonalAPITokens/usePersonalAPITokens';
import { usePersonalAPITokensApi } from 'hooks/api/actions/usePersonalAPITokensApi/usePersonalAPITokensApi';
import Input from 'component/common/Input/Input';
import SelectMenu from 'component/common/select';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import { DateTimePicker } from 'component/common/DateTimePicker/DateTimePicker';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

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

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(4),
    },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

enum ExpirationOption {
    '7DAYS' = '7d',
    '30DAYS' = '30d',
    '60DAYS' = '60d',
    NEVER = 'never',
    CUSTOM = 'custom',
}

const expirationOptions = [
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

enum ErrorField {
    DESCRIPTION = 'description',
    EXPIRES_AT = 'expiresAt',
}

interface ICreatePersonalAPITokenErrors {
    [ErrorField.DESCRIPTION]?: string;
    [ErrorField.EXPIRES_AT]?: string;
}

interface ICreatePersonalAPITokenProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: INewPersonalAPIToken) => void;
}

export const CreatePersonalAPIToken: FC<ICreatePersonalAPITokenProps> = ({
    open,
    setOpen,
    newToken,
}) => {
    const { tokens, refetchTokens } = usePersonalAPITokens();
    const { createPersonalAPIToken, loading } = usePersonalAPITokensApi();
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { locationSettings } = useLocationSettings();

    const [description, setDescription] = useState('');
    const [expiration, setExpiration] = useState<ExpirationOption>(
        ExpirationOption['30DAYS']
    );
    const [errors, setErrors] = useState<ICreatePersonalAPITokenErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    const calculateDate = () => {
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

    const [expiresAt, setExpiresAt] = useState(calculateDate());

    useEffect(() => {
        setDescription('');
        setErrors({});
        setExpiration(ExpirationOption['30DAYS']);
    }, [open]);

    useEffect(() => {
        clearError(ErrorField.EXPIRES_AT);
        setExpiresAt(calculateDate());
    }, [expiration]);

    const getPersonalAPITokenPayload = () => {
        return {
            description,
            expiresAt,
        };
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const token = await createPersonalAPIToken(
                getPersonalAPITokenPayload()
            );
            newToken(token);
            refetchTokens();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/user/tokens' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getPersonalAPITokenPayload(), undefined, 2)}'`;
    };

    const isDescriptionEmpty = (description: string) => description.length;
    const isDescriptionUnique = (description: string) =>
        !tokens?.some(token => token.description === description);
    const isValid =
        isDescriptionEmpty(description) &&
        isDescriptionUnique(description) &&
        expiresAt > new Date();

    const onSetDescription = (description: string) => {
        clearError(ErrorField.DESCRIPTION);
        if (!isDescriptionUnique(description)) {
            setError(
                ErrorField.DESCRIPTION,
                'A personal API token with that description already exists.'
            );
        }
        setDescription(description);
    };

    const customExpiration = expiration === ExpirationOption.CUSTOM;

    const neverExpires =
        expiresAt.getFullYear() > new Date().getFullYear() + 100;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Create personal API token"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Create personal API token"
                description="Use personal API tokens to authenticate to the Unleash API as
                yourself. A personal API token has the same access privileges as
                your user."
                documentationLink="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
                documentationLinkLabel="Tokens documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
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
                                    setExpiration(
                                        e.target.value as ExpirationOption
                                    )
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
                                                The token will{' '}
                                                <strong>never</strong> expire!
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
                                    We strongly recommend that you set an
                                    expiration date for your token to help keep
                                    your information secure.
                                </StyledAlert>
                            }
                        />
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            Create token
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
