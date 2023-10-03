import {
    Button,
    FormControl,
    FormControlLabel,
    Link,
    Radio,
    RadioGroup,
    styled,
} from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import Input from 'component/common/Input/Input';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IUser } from 'interfaces/user';
import {
    IServiceAccountPayload,
    useServiceAccountsApi,
} from 'hooks/api/actions/useServiceAccountsApi/useServiceAccountsApi';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import {
    calculateExpirationDate,
    ExpirationOption,
    IPersonalAPITokenFormErrors,
    PersonalAPITokenForm,
} from 'component/user/Profile/PersonalAPITokensTab/CreatePersonalAPIToken/PersonalAPITokenForm/PersonalAPITokenForm';
import { useServiceAccountTokensApi } from 'hooks/api/actions/useServiceAccountTokensApi/useServiceAccountTokensApi';
import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import { ServiceAccountTokens } from './ServiceAccountTokens/ServiceAccountTokens';
import { IServiceAccount } from 'interfaces/service-account';
import { RoleSelect } from 'component/common/RoleSelect/RoleSelect';
import { IRole } from 'interfaces/role';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledRoleSelect = styled(RoleSelect)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledSecondaryContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusMedium,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledInlineContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
    '& > p:not(:first-of-type)': {
        marginTop: theme.spacing(2),
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

enum TokenGeneration {
    LATER = 'later',
    NOW = 'now',
}

enum ErrorField {
    USERNAME = 'username',
}

interface IServiceAccountModalErrors {
    [ErrorField.USERNAME]?: string;
}

const DEFAULT_EXPIRATION = ExpirationOption['30DAYS'];

interface IServiceAccountModalProps {
    serviceAccount?: IServiceAccount;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: INewPersonalAPIToken) => void;
}

export const ServiceAccountModal = ({
    serviceAccount,
    open,
    setOpen,
    newToken,
}: IServiceAccountModalProps) => {
    const { users } = useUsers();
    const { serviceAccounts, roles, refetch } = useServiceAccounts();
    const { addServiceAccount, updateServiceAccount, loading } =
        useServiceAccountsApi();
    const { createServiceAccountToken } = useServiceAccountTokensApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [rootRole, setRootRole] = useState<IRole | null>(null);
    const [tokenGeneration, setTokenGeneration] = useState<TokenGeneration>(
        TokenGeneration.LATER
    );
    const [errors, setErrors] = useState<IServiceAccountModalErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    const [patDescription, setPatDescription] = useState('');
    const [patExpiration, setPatExpiration] =
        useState<ExpirationOption>(DEFAULT_EXPIRATION);
    const [patExpiresAt, setPatExpiresAt] = useState(
        calculateExpirationDate(DEFAULT_EXPIRATION)
    );
    const [patErrors, setPatErrors] = useState<IPersonalAPITokenFormErrors>({});

    const editing = serviceAccount !== undefined;

    useEffect(() => {
        setName(serviceAccount?.name || '');
        setUsername(serviceAccount?.username || '');
        setRootRole(
            roles.find(({ id }) => id === serviceAccount?.rootRole) || null
        );
        setTokenGeneration(TokenGeneration.LATER);
        setErrors({});

        setPatDescription('');
        setPatExpiration(DEFAULT_EXPIRATION);
        setPatExpiresAt(calculateExpirationDate(DEFAULT_EXPIRATION));
        setPatErrors({});
    }, [open, serviceAccount]);

    const getServiceAccountPayload = (): IServiceAccountPayload => ({
        name,
        username,
        rootRole: rootRole?.id || 0,
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (editing) {
                await updateServiceAccount(
                    serviceAccount.id,
                    getServiceAccountPayload()
                );
            } else {
                const { id } = await addServiceAccount(
                    getServiceAccountPayload()
                );
                if (tokenGeneration === TokenGeneration.NOW) {
                    const token = await createServiceAccountToken(id, {
                        description: patDescription,
                        expiresAt: patExpiresAt,
                    });
                    newToken(token);
                }
            }
            setToastData({
                title: `Service account ${
                    editing ? 'updated' : 'added'
                } successfully`,
                type: 'success',
            });
            refetch();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request ${editing ? 'PUT' : 'POST'} '${
            uiConfig.unleashUrl
        }/api/admin/service-account${editing ? `/${serviceAccount.id}` : ''}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getServiceAccountPayload(), undefined, 2)}'`;
    };

    const isNotEmpty = (value: string) => value.length;
    const isUnique = (value: string) =>
        !users?.some((user: IUser) => user.username === value) &&
        !serviceAccounts?.some(
            (serviceAccount: IServiceAccount) =>
                serviceAccount.username === value
        );
    const isRoleValid = rootRole !== null;
    const isPATValid =
        tokenGeneration === TokenGeneration.LATER ||
        (isNotEmpty(patDescription) && patExpiresAt > new Date());
    const isValid =
        isNotEmpty(name) &&
        isNotEmpty(username) &&
        (editing || isUnique(username)) &&
        isRoleValid &&
        isPATValid;

    const suggestUsername = () => {
        if (isNotEmpty(name) && !isNotEmpty(username)) {
            const normalizedFromName = `service-${name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w_-]/g, '')}`;
            if (isUnique(normalizedFromName)) {
                setUsername(normalizedFromName);
            }
        }
    };

    const onSetUsername = (username: string) => {
        clearError(ErrorField.USERNAME);
        if (!isUnique(username)) {
            setError(
                ErrorField.USERNAME,
                'A service account or user with that username already exists.'
            );
        }
        setUsername(username);
    };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={editing ? 'Edit service account' : 'New service account'}
        >
            <FormTemplate
                loading={loading}
                modal
                title={editing ? 'Edit service account' : 'New service account'}
                description="A service account is a special type of account that can only be used to authenticate with the Unleash API. Service accounts can be used to automate tasks."
                documentationLink="https://docs.getunleash.io"
                documentationLinkLabel="Service accounts documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            What is your new service account name?
                        </StyledInputDescription>
                        <StyledInput
                            autoFocus
                            label="Service account name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onBlur={suggestUsername}
                            autoComplete="off"
                            required
                        />
                        <StyledInputDescription>
                            What is your new service account username?
                        </StyledInputDescription>
                        <StyledInput
                            label="Service account username"
                            error={Boolean(errors.username)}
                            errorText={errors.username}
                            value={username}
                            onChange={e => onSetUsername(e.target.value)}
                            autoComplete="off"
                            required
                            disabled={editing}
                        />
                        <StyledInputDescription>
                            What is your service account allowed to do?
                        </StyledInputDescription>
                        <StyledRoleSelect
                            roles={roles}
                            value={rootRole}
                            setValue={setRootRole}
                            required
                        />
                        <ConditionallyRender
                            condition={!editing}
                            show={
                                <StyledSecondaryContainer>
                                    <StyledInputDescription>
                                        Token
                                    </StyledInputDescription>
                                    <StyledInputSecondaryDescription>
                                        In order to connect your newly created
                                        service account, you will also need a
                                        token.{' '}
                                        <Link
                                            href="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Read more about API tokens
                                        </Link>
                                        .
                                    </StyledInputSecondaryDescription>
                                    <FormControl>
                                        <RadioGroup
                                            value={tokenGeneration}
                                            onChange={e =>
                                                setTokenGeneration(
                                                    e.target
                                                        .value as TokenGeneration
                                                )
                                            }
                                            name="token-generation"
                                        >
                                            <FormControlLabel
                                                value={TokenGeneration.LATER}
                                                control={<Radio />}
                                                label="I want to generate a token later"
                                            />
                                            <FormControlLabel
                                                value={TokenGeneration.NOW}
                                                control={<Radio />}
                                                label="Generate a token now"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <StyledInlineContainer>
                                        <StyledInputSecondaryDescription>
                                            A new personal access token (PAT)
                                            will be generated for the service
                                            account, so you can get started
                                            right away.
                                        </StyledInputSecondaryDescription>
                                        <ConditionallyRender
                                            condition={
                                                tokenGeneration ===
                                                TokenGeneration.NOW
                                            }
                                            show={
                                                <PersonalAPITokenForm
                                                    description={patDescription}
                                                    setDescription={
                                                        setPatDescription
                                                    }
                                                    expiration={patExpiration}
                                                    setExpiration={
                                                        setPatExpiration
                                                    }
                                                    expiresAt={patExpiresAt}
                                                    setExpiresAt={
                                                        setPatExpiresAt
                                                    }
                                                    errors={patErrors}
                                                    setErrors={setPatErrors}
                                                />
                                            }
                                        />
                                    </StyledInlineContainer>
                                </StyledSecondaryContainer>
                            }
                            elseShow={
                                <>
                                    <StyledInputDescription>
                                        Service account tokens
                                    </StyledInputDescription>
                                    <ServiceAccountTokens
                                        serviceAccount={serviceAccount!}
                                    />
                                </>
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
                            {editing ? 'Save' : 'Add'} service account
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
