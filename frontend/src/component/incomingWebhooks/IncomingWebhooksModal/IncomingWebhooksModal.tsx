import { FormEvent, useEffect, useState } from 'react';
import { Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import {
    IncomingWebhookPayload,
    useIncomingWebhooksApi,
} from 'hooks/api/actions/useIncomingWebhooksApi/useIncomingWebhooksApi';
import { useIncomingWebhookTokensApi } from 'hooks/api/actions/useIncomingWebhookTokensApi/useIncomingWebhookTokensApi';
import {
    IncomingWebhooksFormErrors,
    IncomingWebhooksForm,
    TokenGeneration,
    DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS,
} from './IncomingWebhooksForm/IncomingWebhooksForm';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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

interface IIncomingWebhooksModalProps {
    incomingWebhook?: IIncomingWebhook;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: string) => void;
}

export const IncomingWebhooksModal = ({
    incomingWebhook,
    open,
    setOpen,
    newToken,
}: IIncomingWebhooksModalProps) => {
    const { incomingWebhooks, refetch } = useIncomingWebhooks();
    const { addIncomingWebhook, updateIncomingWebhook, loading } =
        useIncomingWebhooksApi();
    const { addIncomingWebhookToken } = useIncomingWebhookTokensApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tokenGeneration, setTokenGeneration] = useState<TokenGeneration>(
        TokenGeneration.LATER,
    );
    const [tokenName, setTokenName] = useState('');
    const [errors, setErrors] = useState<IncomingWebhooksFormErrors>(
        DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS,
    );
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        setEnabled(incomingWebhook?.enabled || false);
        setName(incomingWebhook?.name || '');
        setDescription(incomingWebhook?.description || '');
        setTokenGeneration(TokenGeneration.LATER);
        setTokenName('');
        setErrors(DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS);
    }, [open, incomingWebhook]);

    const editing = incomingWebhook !== undefined;
    const title = `${editing ? 'Edit' : 'New'} incoming webhook`;

    // TODO: useForm / useFormValidation hook?
    const isEmpty = (value: string) => !value.length;
    const isNameNotUnique = (value: string) =>
        !incomingWebhooks?.some(
            ({ id, name }) => id !== incomingWebhook?.id && name === value,
        );
    const validateName = (name: string) => {
        if (isEmpty(name)) {
            setError(ErrorField.NAME, 'Name is required.');
            return false;
        }

        if (isNameNotUnique(name)) {
            setError(ErrorField.NAME, 'Name must be unique.');
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };
    const validateTokenName = (tokenName: string) => {
        if (tokenGeneration === TokenGeneration.NOW && isEmpty(tokenName)) {
            setError(ErrorField.TOKEN_NAME, 'Token name is required.');
            return false;
        }

        clearError(ErrorField.TOKEN_NAME);
        return true;
    };
    const validate = () => {
        const validName = validateName(name);
        const validTokenName = validateTokenName(tokenName);

        setValidated(true);

        return validName && validTokenName;
    };

    const showErrors = validated && Object.values(errors).some(Boolean);

    const payload: IncomingWebhookPayload = {
        enabled,
        name,
        description,
    };

    const formatApiCode = () => `curl --location --request ${
        editing ? 'PUT' : 'POST'
    } '${uiConfig.unleashUrl}/api/admin/incoming-webhooks${
        editing ? `/${incomingWebhook.id}` : ''
    }' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editing) {
                await updateIncomingWebhook(incomingWebhook.id, payload);
            } else {
                const { id } = await addIncomingWebhook(payload);
                if (tokenGeneration === TokenGeneration.NOW) {
                    const { token } = await addIncomingWebhookToken(id, {
                        name: tokenName,
                    });
                    newToken(token);
                }
            }
            setToastData({
                title: `Incoming webhook ${
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

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading}
                modal
                title={title}
                description='Incoming Webhooks allow third-party services to send observable events to Unleash.'
                documentationLink='https://docs.getunleash.io/reference/incoming-webhooks'
                documentationLinkLabel='Incoming webhooks documentation'
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={onSubmit}>
                    <IncomingWebhooksForm
                        incomingWebhook={incomingWebhook}
                        enabled={enabled}
                        name={name}
                        description={description}
                        tokenGeneration={tokenGeneration}
                        tokenName={tokenName}
                        setEnabled={setEnabled}
                        setName={setName}
                        setDescription={setDescription}
                        setTokenGeneration={setTokenGeneration}
                        setTokenName={setTokenName}
                        errors={errors}
                        showErrors={showErrors}
                        validateName={validateName}
                        validateTokenName={validateTokenName}
                    />
                    <StyledButtonContainer>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
                        >
                            {editing ? 'Save' : 'Add'} incoming webhook
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
