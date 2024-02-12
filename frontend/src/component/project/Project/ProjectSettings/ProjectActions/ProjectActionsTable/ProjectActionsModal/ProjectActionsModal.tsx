import { FormEvent, useEffect } from 'react';
import { Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IActionSet } from 'interfaces/action';
import { useActions } from 'hooks/api/getters/useActions/useActions';
import {
    ActionSetPayload,
    useActionsApi,
} from 'hooks/api/actions/useActionsApi/useActionsApi';
import { ProjectActionsForm } from './ProjectActionsForm/ProjectActionsForm';
import { useProjectActionsForm } from './ProjectActionsForm/useProjectActionsForm';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

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
}

export const ProjectActionsModal = ({
    action,
    open,
    setOpen,
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
        validate,
        validated,
        reloadForm,
    } = useProjectActionsForm(action);

    useEffect(() => {
        reloadForm();
    }, [open]);

    const editing = action !== undefined;
    const title = `${editing ? 'Edit' : 'New'} action`;

    const payload: ActionSetPayload = {
        project: projectId,
        enabled,
        name,
        match: {
            source: 'incoming-webhook',
            sourceId,
            payload: filters
                .filter((f) => f.parameter.length > 0)
                .reduce(
                    (acc, filter) => ({
                        ...acc,
                        [filter.parameter]: filter.value,
                    }),
                    {},
                ),
        },
        actorId,
        actions: actions.map(({ action, sortOrder, executionParams }) => ({
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

        if (!validate()) return;

        try {
            if (editing) {
                await updateActionSet(action.id, payload);
            } else {
                await addActionSet(payload);
            }
            setToastData({
                title: `action ${editing ? 'updated' : 'added'} successfully`,
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
                description='Actions allow you to configure automations based on specific triggers, like incoming webhooks.'
                documentationLink='https://docs.getunleash.io/reference/actions'
                documentationLinkLabel='Actions documentation'
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={onSubmit}>
                    <ProjectActionsForm
                        action={action}
                        enabled={enabled}
                        setEnabled={setEnabled}
                        name={name}
                        setName={setName}
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
