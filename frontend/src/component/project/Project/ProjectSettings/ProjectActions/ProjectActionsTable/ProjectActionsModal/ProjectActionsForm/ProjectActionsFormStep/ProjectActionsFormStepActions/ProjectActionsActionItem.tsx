import { Alert, IconButton, Tooltip, styled } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { ActionsActionState } from '../../useProjectActionsForm.ts';
import { ProjectActionsFormItem } from '../ProjectActionsFormItem.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useServiceAccountAccessOverview } from 'hooks/api/getters/useServiceAccountAccessOverview/useServiceAccountAccessOverview';
import { useEffect, useMemo } from 'react';
import { ProjectActionsActionParameter } from './ProjectActionsActionParameter/ProjectActionsActionParameter.tsx';
import type { ActionConfigurations } from 'interfaces/action';
import { ProjectActionsActionSelect } from './ProjectActionsActionSelect.tsx';

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
    actionConfigurations: ActionConfigurations;
    validated: boolean;
}

export const ProjectActionsActionItem = ({
    action,
    index,
    stateChanged,
    actorId,
    onDelete,
    actionConfigurations,
    validated,
}: IProjectActionsItemProps) => {
    const { action: actionName, executionParams, error } = action;
    const projectId = useRequiredPathParam('projectId');
    const { permissions } = useServiceAccountAccessOverview(
        actorId,
        projectId,
        executionParams.environment as string,
    );

    const actionConfiguration = actionConfigurations.get(actionName);

    const hasPermission = useMemo(() => {
        const requiredPermissions = actionConfiguration?.permissions;

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
    }, [actionConfiguration, permissions]);

    useEffect(() => {
        stateChanged({
            ...action,
            error: undefined,
        });

        const requiredParameters =
            actionConfiguration?.parameters
                .filter(({ optional }) => !optional)
                .map(({ name }) => name) || [];

        if (requiredParameters.some((required) => !executionParams[required])) {
            stateChanged({
                ...action,
                error: 'Please fill all required fields.',
            });
        }
    }, [actionConfiguration, executionParams]);

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
        actionConfiguration?.parameters.filter(
            ({ type }) => type !== 'hidden',
        ) || [];

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
                            actionConfigurations={actionConfigurations}
                        />
                    </StyledFieldContainer>
                </StyledItemRow>
                <ConditionallyRender
                    condition={parameters.length > 0}
                    show={
                        <StyledItemRow>
                            {parameters.map((parameter) => (
                                <StyledFieldContainer key={parameter.name}>
                                    <ProjectActionsActionParameter
                                        parameter={parameter}
                                        value={
                                            executionParams[
                                                parameter.name
                                            ] as string
                                        }
                                        onChange={(value) =>
                                            stateChanged({
                                                ...action,
                                                executionParams: {
                                                    ...executionParams,
                                                    [parameter.name]: value,
                                                },
                                            })
                                        }
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
