import { type FormEvent, useEffect } from 'react';
import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ISignalEndpoint } from 'interfaces/signal';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import {
    type SignalEndpointPayload,
    useSignalEndpointsApi,
} from 'hooks/api/actions/useSignalEndpointsApi/useSignalEndpointsApi';
import { useSignalEndpointTokensApi } from 'hooks/api/actions/useSignalEndpointTokensApi/useSignalEndpointTokensApi';
import { SignalEndpointsForm } from './SignalEndpointsForm/SignalEndpointsForm.tsx';
import {
    TokenGeneration,
    useSignalEndpointsForm,
} from './SignalEndpointsForm/useSignalEndpointsForm.ts';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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

interface ISignalEndpointsModalProps {
    signalEndpoint?: ISignalEndpoint;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: string, signalEndpoint: ISignalEndpoint) => void;
    onOpenSignals: () => void;
}

export const SignalEndpointsModal = ({
    signalEndpoint,
    open,
    setOpen,
    newToken,
    onOpenSignals,
}: ISignalEndpointsModalProps) => {
    const { refetch } = useSignalEndpoints();
    const { addSignalEndpoint, updateSignalEndpoint, loading } =
        useSignalEndpointsApi();
    const { addSignalEndpointToken } = useSignalEndpointTokensApi();
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
    } = useSignalEndpointsForm(signalEndpoint);

    useEffect(() => {
        reloadForm();
    }, [open]);

    const editing = signalEndpoint !== undefined;
    const title = `${editing ? 'Edit' : 'New'} signal endpoint`;

    const payload: SignalEndpointPayload = {
        enabled,
        name,
        description,
    };

    const formatApiCode = () => `curl --location --request ${
        editing ? 'PUT' : 'POST'
    } '${uiConfig.unleashUrl}/api/admin/signal-endpoints${
        editing ? `/${signalEndpoint.id}` : ''
    }' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editing) {
                await updateSignalEndpoint(signalEndpoint.id, payload);
            } else {
                const signalEndpoint = await addSignalEndpoint(payload);
                if (tokenGeneration === TokenGeneration.NOW) {
                    const { token } = await addSignalEndpointToken(
                        signalEndpoint.id,
                        {
                            name: tokenName,
                        },
                    );
                    newToken(token, signalEndpoint);
                }
            }
            setToastData({
                text: `Signal endpoint ${editing ? 'updated' : 'added'}`,
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
                description='Signal endpoints allow third-party services to send signals to Unleash.'
                documentationLink='https://docs.getunleash.io/concepts/signals'
                documentationLinkLabel='Signals documentation'
                formatApiCode={formatApiCode}
            >
                <StyledHeader>
                    <StyledTitle>{title}</StyledTitle>
                    <ConditionallyRender
                        condition={editing}
                        show={<Link onClick={onOpenSignals}>View signals</Link>}
                    />
                </StyledHeader>
                <StyledForm onSubmit={onSubmit}>
                    <SignalEndpointsForm
                        signalEndpoint={signalEndpoint}
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
                            {editing ? 'Save' : 'Add'} signal endpoint
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
