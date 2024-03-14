import { Alert, IconButton, Tooltip, styled } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ActionsActionState } from '../../useProjectActionsForm';
import { ProjectActionsFormItem } from '../ProjectActionsFormItem';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useServiceAccountAccessMatrix } from 'hooks/api/getters/useServiceAccountAccessMatrix/useServiceAccountAccessMatrix';
import { useEffect, useMemo } from 'react';
import { ProjectActionsActionParameterAutocomplete } from './ProjectActionsActionParameter/ProjectActionsActionParameterAutocomplete';
import { ActionDefinitions } from './useActionDefinitions';
import { ProjectActionsActionSelect } from './ProjectActionsActionSelect';

const StyledItemBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: theme.spacing(2),
}));

const StyledItemRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
    flexWrap: 'wrap',
}));

const StyledFieldContainer = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: theme.spacing(25),
}));

interface IProjectActionsItemProps {
    action: ActionsActionState;
    index: number;
    stateChanged: (action: ActionsActionState) => void;
    actorId: number;
    onDelete: () => void;
    actionDefinitions: ActionDefinitions;
    validated: boolean;
}

export const ProjectActionsActionItem = ({
    action,
    index,
    stateChanged,
    actorId,
    onDelete,
    actionDefinitions,
    validated,
}: IProjectActionsItemProps) => {
    const { action: actionName, executionParams, error } = action;
    const projectId = useRequiredPathParam('projectId');
    const { permissions } = useServiceAccountAccessMatrix(
        actorId,
        projectId,
        executionParams.environment as string,
    );

    const actionDefinition = actionDefinitions.get(actionName);

    const hasPermission = useMemo(() => {
        const requiredPermissions = actionDefinition?.permissions;

        const { environment: actionEnvironment } = executionParams;

        if (
            permissions.length === 0 ||
            !requiredPermissions ||
            !actionEnvironment
        ) {
            return true;
        }

        return requiredPermissions.some((requiredPermission) =>
            permissions.some(
                ({ permission, project, environment }) =>
                    permission === requiredPermission &&
                    project === projectId &&
                    environment === actionEnvironment,
            ),
        );
    }, [actionDefinition, permissions]);

    useEffect(() => {
        stateChanged({
            ...action,
            error: undefined,
        });

        const requiredParameters =
            actionDefinition?.parameters
                .filter(({ optional }) => !optional)
                .map(({ name }) => name) || [];

        if (requiredParameters.some((required) => !executionParams[required])) {
            stateChanged({
                ...action,
                error: 'Please fill all required fields.',
            });
        }
    }, [actionDefinition, executionParams]);

    const header = (
        <>
            <span>Action {index + 1}</span>
            <div>
                <Tooltip title='Delete action' arrow>
                    <IconButton onClick={onDelete}>
                        <Delete />
                    </IconButton>
                </Tooltip>
            </div>
        </>
    );

    const parameters =
        actionDefinition?.parameters.filter(({ hidden }) => !hidden) || [];

    return (
        <ProjectActionsFormItem index={index} header={header} separator='THEN'>
            <StyledItemBody>
                <StyledItemRow>
                    <StyledFieldContainer>
                        <ProjectActionsActionSelect
                            value={actionName}
                            onChange={(value) =>
                                stateChanged({
                                    ...action,
                                    action: value,
                                })
                            }
                            actionDefinitions={actionDefinitions}
                        />
                    </StyledFieldContainer>
                </StyledItemRow>
                <ConditionallyRender
                    condition={parameters.length > 0}
                    show={
                        <StyledItemRow>
                            {parameters.map(({ name, label, options }) => (
                                <StyledFieldContainer key={name}>
                                    <ProjectActionsActionParameterAutocomplete
                                        label={label}
                                        value={executionParams[name] as string}
                                        onChange={(value) =>
                                            stateChanged({
                                                ...action,
                                                executionParams: {
                                                    ...executionParams,
                                                    [name]: value,
                                                },
                                            })
                                        }
                                        options={options}
                                    />
                                </StyledFieldContainer>
                            ))}
                        </StyledItemRow>
                    }
                />
                <ConditionallyRender
                    condition={validated && Boolean(error)}
                    show={<Alert severity='error'>{error}</Alert>}
                />
                <ConditionallyRender
                    condition={!hasPermission}
                    show={
                        <Alert severity='error'>
                            The selected service account does not have
                            permissions to execute this action currently.
                        </Alert>
                    }
                />
            </StyledItemBody>
        </ProjectActionsFormItem>
    );
};
