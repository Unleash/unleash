import { Button, FormControlLabel, Radio, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import Input from 'component/common/Input/Input';
import IRole from 'interfaces/role';
import { useRoleForm } from '../RoleForm/useRoleForm';

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

const StyledRoleBox = styled(FormControlLabel)(({ theme }) => ({
    margin: theme.spacing(0.5, 0),
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
}));

const StyledRoleRadio = styled(Radio)(({ theme }) => ({
    marginRight: theme.spacing(2),
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

interface IRoleModalProps {
    role?: IRole;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoleModal = ({ role, open, setOpen }: IRoleModalProps) => {
    // const { name, description, permissions, getRolePayload } = useRoleForm();

    // const handlePermissionChange = (permission: IPermission) => {
    //     let checkedPermissionsCopy = cloneDeep(checkedPermissions);

    //     if (checkedPermissionsCopy[permission.id]) {
    //         delete checkedPermissionsCopy[permission.id];
    //     } else {
    //         checkedPermissionsCopy[permission.id] = { ...permission };
    //     }

    //     setCheckedPermissions(checkedPermissionsCopy);
    // };

    // const onToggleAllPermissions = () => {
    //     let checkedPermissionsCopy = cloneDeep(checkedPermissions);

    //     const allChecked = granularPermissions.every(
    //         (permission: IPermission) => checkedPermissionsCopy[permission.id]
    //     );

    //     if (allChecked) {
    //         granularPermissions.forEach((permission: IPermission) => {
    //             delete checkedPermissionsCopy[permission.id];
    //         });
    //     } else {
    //         granularPermissions.forEach((permission: IPermission) => {
    //             checkedPermissionsCopy[permission.id] = {
    //                 ...permission,
    //             };
    //         });
    //     }

    //     setCheckedPermissions(checkedPermissionsCopy);
    // };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="TODO"
            // label={editing ? 'Edit service account' : 'New service account'}
        >
            <div>TODO: Use RoleForm</div>
            {/* <FormTemplate
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
                        <FormControl>
                            <RadioGroup
                                name="rootRole"
                                value={rootRole || ''}
                                onChange={e => setRootRole(+e.target.value)}
                                data-loading
                            >
                                {roles
                                    .sort((a, b) => (a.name < b.name ? -1 : 1))
                                    .map(role => (
                                        <StyledRoleBox
                                            key={`role-${role.id}`}
                                            labelPlacement="end"
                                            label={
                                                <div>
                                                    <strong>{role.name}</strong>
                                                    <Typography variant="body2">
                                                        {role.description}
                                                    </Typography>
                                                </div>
                                            }
                                            control={
                                                <StyledRoleRadio
                                                    checked={
                                                        role.id === rootRole
                                                    }
                                                />
                                            }
                                            value={role.id}
                                        />
                                    ))}
                            </RadioGroup>
                        </FormControl>
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
            </FormTemplate> */}
        </SidebarModal>
    );
};
