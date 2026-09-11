import { type FormEvent, useEffect } from 'react';
import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IActionSet } from 'interfaces/action';
import { useActions } from 'hooks/api/getters/useActions/useActions';
import {
    type ActionSetPayload,
    useActionsApi,
} from 'hooks/api/actions/useActionsApi/useActionsApi';
import { ProjectActionsForm } from './ProjectActionsForm/ProjectActionsForm.tsx';
import { useProjectActionsForm } from './ProjectActionsForm/useProjectActionsForm.ts';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useTracking } from 'hooks/useTracking';
import {
    type ActionModalOpenedFrom,
    projectActionSizeProps,
    projectActionChangedFields,
    projectActionCreatedTracking,
    projectActionEditedTracking,
} from '../../projectActionsTracking.ts';

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

interface IProjectActionsModalProps {
    action?: IActionSet;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenEvents: () => void;
    openedFrom?: ActionModalOpenedFrom;
}

export const ProjectActionsModal = ({
    action,
    open,
    setOpen,
    onOpenEvents,
    openedFrom,
}: IProjectActionsModalProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { refetch } = useActions(projectId);
    const { addActionSet, updateActionSet, loading } = useActionsApi(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const {
        enabled,
        setEnabled,
        name,
        setName,
        description,
        setDescription,
        sourceId,
        setSourceId,
        filters,
        setFilters,
        actorId,
        setActorId,
        actions,
        setActions,
        errors,
        validateName,
        validateSourceId,
        validateActorId,
        validate,
        validated,
        reloadForm,
    } = useProjectActionsForm(action);

    useEffect(() => {
        reloadForm();
    }, [open]);

    const editing = action !== undefined;
    const tracking = editing
        ? { ...projectActionEditedTracking, props: { openedFrom } }
        : projectActionCreatedTracking;
    const trackProjectAction = useTracking(tracking);
    const title = `${editing ? 'Edit' : 'New'} action`;

    const payload: ActionSetPayload = {
        enabled,
        name,
        description,
        match: {
            source: 'signal-endpoint',
            sourceId,
            payload: filters
                .filter((f) => f.parameter.length > 0)
                .reduce(
                    (
                        acc,
                        {
                            parameter,
                            inverted,
                            operator,
                            caseInsensitive,
                            value,
                            values,
                        },
                    ) => ({
                        ...acc,
                        [parameter]: {
                            inverted,
                            operator,
                            caseInsensitive,
                            value,
                            values,
                        },
                    }),
                    {},
                ),
        },
        actorId,
        actions: actions
            .filter(({ action }) => Boolean(action))
            .map(({ action, sortOrder, executionParams }) => ({
                action,
                sortOrder,
                executionParams,
            })),
    };

    const formatApiCode = () => `curl --location --request ${
        editing ? 'PUT' : 'POST'
    } '${uiConfig.unleashUrl}/api/admin/projects/${projectId}/actions${
        editing ? `/${action.id}` : ''
    }' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trackingProps = {
            ...projectActionSizeProps(payload),
            newState: enabled ? 'enabled' : 'disabled',
            changedFields: action
                ? projectActionChangedFields(payload, action)
                : undefined,
        };

        if (!validate()) {
            trackProjectAction.validationFailed(trackingProps);
            return;
        }

        try {
            await trackProjectAction.mutation(
                () =>
                    editing
                        ? updateActionSet(action.id, payload)
                        : addActionSet(payload),
                trackingProps,
            );
            setToastData({
                text: `action ${editing ? 'updated' : 'added'} successfully`,
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
            tracking={tracking}
        >
            <FormTemplate
                loading={loading}
                modal
                description='Actions allow you to configure automations based on specific signals, like the ones originated from signal endpoints.'
                documentationLink='https://docs.getunleash.io/concepts/actions'
                documentationLinkLabel='Actions documentation'
                formatApiCode={formatApiCode}
            >
                <StyledHeader>
                    <StyledTitle>{title}</StyledTitle>
                    <ConditionallyRender
                        condition={editing}
                        show={<Link onClick={onOpenEvents}>View events</Link>}
                    />
                </StyledHeader>
                <StyledForm onSubmit={onSubmit}>
                    <ProjectActionsForm
                        enabled={enabled}
                        setEnabled={setEnabled}
                        name={name}
                        setName={setName}
                        description={description}
                        setDescription={setDescription}
                        sourceId={sourceId}
                        setSourceId={setSourceId}
                        filters={filters}
                        setFilters={setFilters}
                        actorId={actorId}
                        setActorId={setActorId}
                        actions={actions}
                        setActions={setActions}
                        errors={errors}
                        validateName={validateName}
                        validateSourceId={validateSourceId}
                        validateActorId={validateActorId}
                        validated={validated}
                    />
                    <StyledButtonContainer>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
                        >
                            {editing ? 'Save' : 'Add'} action
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                trackProjectAction('dismissed', {
                                    method: 'cancel-button',
                                });
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
