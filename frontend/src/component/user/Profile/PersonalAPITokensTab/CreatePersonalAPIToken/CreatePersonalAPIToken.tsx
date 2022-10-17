import { Button, styled, Typography } from '@mui/material';
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

const StyledExpirationPicker = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
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
];

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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const clearErrors = () => {
        setErrors({});
    };

    const calculateDate = () => {
        const expiresAt = new Date();
        const expirationOption = expirationOptions.find(
            ({ key }) => key === expiration
        );
        if (expirationOption) {
            expiresAt.setDate(expiresAt.getDate() + expirationOption.days);
        }
        return expiresAt;
    };

    const [expiresAt, setExpiresAt] = useState(calculateDate());

    useEffect(() => {
        setDescription('');
        setExpiration(ExpirationOption['30DAYS']);
    }, [open]);

    useEffect(() => {
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
        isDescriptionEmpty(description) && isDescriptionUnique(description);

    const onSetDescription = (description: string) => {
        clearErrors();
        if (!isDescriptionUnique(description)) {
            setErrors({
                description:
                    'A personal API token with that description already exists.',
            });
        }
        setDescription(description);
    };

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
                        <StyledExpirationPicker>
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
                                condition={Boolean(expiresAt)}
                                show={() => (
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
                        </StyledExpirationPicker>
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
