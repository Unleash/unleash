import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { useIncomingWebhookEvents } from 'hooks/api/getters/useIncomingWebhookEvents/useIncomingWebhookEvents';
import { Suspense, lazy } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SidePanelList } from 'component/common/SidePanelList/SidePanelList';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.fontSizes.mainHeader,
}));

const StyledHeaderRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

const StyledHeaderSubtitle = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledTitle = styled('h1')({
    fontWeight: 'normal',
});

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

interface IIncomingWebhooksEventsModalProps {
    incomingWebhook?: IIncomingWebhook;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenConfiguration: () => void;
}

export const IncomingWebhooksEventsModal = ({
    incomingWebhook,
    open,
    setOpen,
    onOpenConfiguration,
}: IIncomingWebhooksEventsModalProps) => {
    const { uiConfig } = useUiConfig();
    const { locationSettings } = useLocationSettings();
    const { incomingWebhookEvents, hasMore, loadMore, loading } =
        useIncomingWebhookEvents(incomingWebhook?.id, 20, {
            refreshInterval: 5000,
        });

    if (!incomingWebhook) {
        return null;
    }

    const title = `Events: ${incomingWebhook.name}`;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading && incomingWebhookEvents.length === 0}
                modal
                title=''
                description='Incoming Webhooks allow third-party services to send observable events to Unleash.'
                documentationLink='https://docs.getunleash.io/reference/incoming-webhooks'
                documentationLinkLabel='Incoming webhooks documentation'
                showGuidance={false}
            >
                <StyledHeader>
                    <StyledHeaderRow>
                        <StyledTitle>{title}</StyledTitle>
                        <Link onClick={onOpenConfiguration}>
                            View configuration
                        </Link>
                    </StyledHeaderRow>
                    <StyledHeaderSubtitle>
                        <p>
                            {uiConfig.unleashUrl}/api/incoming-webhook/
                            {incomingWebhook.name}
                        </p>
                        <StyledDescription>
                            {incomingWebhook.description}
                        </StyledDescription>
                    </StyledHeaderSubtitle>
                </StyledHeader>
                <StyledForm>
                    <SidePanelList
                        height={960}
                        items={incomingWebhookEvents}
                        columns={[
                            {
                                header: 'Date',
                                cell: (event) =>
                                    formatDateYMDHMS(
                                        event.createdAt,
                                        locationSettings?.locale,
                                    ),
                            },
                            {
                                header: 'Token',
                                cell: (event) => event.tokenName,
                            },
                        ]}
                        sidePanelHeader='Payload'
                        renderContent={(event) => (
                            <Suspense fallback={null}>
                                <LazyReactJSONEditor
                                    content={{ json: event.payload }}
                                    readOnly
                                    statusBar={false}
                                    editorStyle='sidePanel'
                                />
                            </Suspense>
                        )}
                        listEnd={
                            <ConditionallyRender
                                condition={hasMore}
                                show={
                                    <Button onClick={loadMore}>
                                        Load more
                                    </Button>
                                }
                            />
                        }
                    />
                    <ConditionallyRender
                        condition={incomingWebhookEvents.length === 0}
                        show={
                            <p>
                                No events have been received for this incoming
                                webhook.
                            </p>
                        }
                    />
                    <StyledButtonContainer>
                        <Button
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
