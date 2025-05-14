import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import type { AddonSchema } from 'openapi';
import { useIntegrationEvents } from 'hooks/api/getters/useIntegrationEvents/useIntegrationEvents';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidePanelList } from 'component/common/SidePanelList/SidePanelList';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IntegrationEventsStateIcon } from './IntegrationEventsStateIcon.tsx';
import { IntegrationEventsDetails } from './IntegrationEventsDetails/IntegrationEventsDetails.tsx';
import { useNavigate } from 'react-router-dom';

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

const StyledTitle = styled('h1')({
    fontWeight: 'normal',
});

const StyledSubtitle = styled('h2')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 'normal',
}));

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledFailedItemWrapper = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.error.light,
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

interface IIntegrationEventsModalProps {
    addon?: AddonSchema;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IntegrationEventsModal = ({
    addon,
    open,
    setOpen,
}: IIntegrationEventsModalProps) => {
    const navigate = useNavigate();
    const { locationSettings } = useLocationSettings();
    const { integrationEvents, hasMore, loadMore, loading } =
        useIntegrationEvents(open ? addon?.id : undefined, 20, {
            refreshInterval: 5000,
        });

    if (!addon) {
        return null;
    }

    const title = `Events: ${addon.provider}${addon.description ? ` - ${addon.description}` : ''} (id: ${addon.id})`;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading && integrationEvents.length === 0}
                modal
                description=''
                documentationLink=''
                documentationLinkLabel=''
                showGuidance={false}
            >
                <StyledHeader>
                    <StyledHeaderRow>
                        <StyledTitle>{title}</StyledTitle>
                        <Link
                            onClick={() => {
                                setOpen(false);
                                navigate(`/integrations/edit/${addon.id}`);
                            }}
                        >
                            View configuration
                        </Link>
                    </StyledHeaderRow>
                    <StyledHeaderRow>
                        <StyledSubtitle>
                            Only the most recent event for each integration and
                            the last 100 events from the past 2 hours will be
                            kept. All other events will be automatically
                            deleted.
                        </StyledSubtitle>
                    </StyledHeaderRow>
                </StyledHeader>
                <StyledForm>
                    <SidePanelList
                        height={960}
                        items={integrationEvents}
                        columns={[
                            {
                                header: 'Status',
                                align: 'center',
                                maxWidth: 100,
                                cell: IntegrationEventsStateIcon,
                            },
                            {
                                header: 'Date',
                                maxWidth: 240,
                                cell: ({ createdAt }) =>
                                    formatDateYMDHMS(
                                        createdAt,
                                        locationSettings?.locale,
                                    ),
                            },
                        ]}
                        sidePanelHeader='Details'
                        renderContent={IntegrationEventsDetails}
                        renderItem={({ id, state }, children) => {
                            if (state === 'failed') {
                                return (
                                    <StyledFailedItemWrapper key={id}>
                                        {children}
                                    </StyledFailedItemWrapper>
                                );
                            }

                            return children;
                        }}
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
                        condition={integrationEvents.length === 0}
                        show={
                            <p>
                                No events have been registered for this
                                integration configuration.
                            </p>
                        }
                    />
                    <StyledButtonContainer>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
