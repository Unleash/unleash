import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import type { IActionSet } from 'interfaces/action';
import { useActionEvents } from 'hooks/api/getters/useActionEvents/useActionEvents';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidePanelList } from 'component/common/SidePanelList/SidePanelList';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectActionsEventsStateCell } from './ProjectActionsEventsStateCell.tsx';
import { ProjectActionsEventsDetails } from './ProjectActionsEventsDetails/ProjectActionsEventsDetails.tsx';

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

interface IProjectActionsEventsModalProps {
    action?: IActionSet;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenConfiguration: () => void;
}

export const ProjectActionsEventsModal = ({
    action,
    open,
    setOpen,
    onOpenConfiguration,
}: IProjectActionsEventsModalProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { locationSettings } = useLocationSettings();
    const { actionEvents, hasMore, loadMore, loading } = useActionEvents(
        action?.id,
        projectId,
        20,
        {
            refreshInterval: 5000,
        },
    );

    if (!action) {
        return null;
    }

    const title = `Events: ${action.name}`;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading && actionEvents.length === 0}
                modal
                description=''
                documentationLink=''
                documentationLinkLabel=''
                showGuidance={false}
            >
                <StyledHeader>
                    <StyledHeaderRow>
                        <StyledTitle>{title}</StyledTitle>
                        <Link onClick={onOpenConfiguration}>
                            View configuration
                        </Link>
                    </StyledHeaderRow>
                </StyledHeader>
                <StyledForm>
                    <SidePanelList
                        height={960}
                        items={actionEvents}
                        columns={[
                            {
                                header: 'Status',
                                align: 'center',
                                maxWidth: 100,
                                cell: ProjectActionsEventsStateCell,
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
                        renderContent={ProjectActionsEventsDetails}
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
                        condition={actionEvents.length === 0}
                        show={
                            <p>
                                No events have been registered for this action
                                set.
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
