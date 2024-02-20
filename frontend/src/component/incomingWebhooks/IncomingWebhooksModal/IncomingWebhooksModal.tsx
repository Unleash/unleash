import { FormEvent, useEffect } from 'react';
import { Button, Link, styled } from '@mui/material';
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
import { IncomingWebhooksForm } from './IncomingWebhooksForm/IncomingWebhooksForm';
import {
    TokenGeneration,
    useIncomingWebhooksForm,
} from './IncomingWebhooksForm/useIncomingWebhooksForm';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.fontSizes.mainHeader,
}));

const StyledTitle = styled('h1')({
    fontWeight: 'normal',
});

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
    onOpenEvents: () => void;
}

export const IncomingWebhooksModal = ({
    incomingWebhook,
    open,
    setOpen,
    newToken,
    onOpenEvents,
}: IIncomingWebhooksModalProps) => {
    const { refetch } = useIncomingWebhooks();
    const { addIncomingWebhook, updateIncomingWebhook, loading } =
        useIncomingWebhooksApi();
    const { addIncomingWebhookToken } = useIncomingWebhookTokensApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const {
        enabled,
        setEnabled,
        name,
        setName,
        description,
        setDescription,
        tokenGeneration,
        setTokenGeneration,
        tokenName,
        setTokenName,
        errors,
        validateName,
        validateTokenName,
        validate,
        validated,
        reloadForm,
    } = useIncomingWebhooksForm(incomingWebhook);

    useEffect(() => {
        reloadForm();
    }, [open]);

    const editing = incomingWebhook !== undefined;
    const title = `${editing ? 'Edit' : 'New'} incoming webhook`;

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
                title=''
                description='Incoming Webhooks allow third-party services to send observable events to Unleash.'
                documentationLink='https://docs.getunleash.io/reference/incoming-webhooks'
                documentationLinkLabel='Incoming webhooks documentation'
                formatApiCode={formatApiCode}
            >
                <StyledHeader>
                    <StyledTitle>{title}</StyledTitle>
                    <Link onClick={onOpenEvents}>View events</Link>
                </StyledHeader>
                <StyledForm onSubmit={onSubmit}>
                    <IncomingWebhooksForm
                        incomingWebhook={incomingWebhook}
                        enabled={enabled}
                        setEnabled={setEnabled}
                        name={name}
                        setName={setName}
                        description={description}
                        setDescription={setDescription}
                        tokenGeneration={tokenGeneration}
                        setTokenGeneration={setTokenGeneration}
                        tokenName={tokenName}
                        setTokenName={setTokenName}
                        errors={errors}
                        validateName={validateName}
                        validateTokenName={validateTokenName}
                        validated={validated}
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
