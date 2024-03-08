import { Alert, IconButton, Tooltip, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { Delete } from '@mui/icons-material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { ActionsActionState } from '../../useProjectActionsForm';
import { ProjectActionsFormItem } from '../ProjectActionsFormItem';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useServiceAccountAccessMatrix } from 'hooks/api/getters/useServiceAccountAccessMatrix/useServiceAccountAccessMatrix';
import { useEffect, useMemo } from 'react';
import { ACTIONS } from '@server/util/constants/actions';

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
}));

const StyledFieldContainer = styled('div')({
    flex: 1,
});

interface IProjectActionsItemProps {
    action: ActionsActionState;
    index: number;
    stateChanged: (action: ActionsActionState) => void;
    actorId: number;
    onDelete: () => void;
    validated: boolean;
}

export const ProjectActionsActionItem = ({
    action,
    index,
    stateChanged,
    actorId,
    onDelete,
    validated,
}: IProjectActionsItemProps) => {
    const { action: actionName, executionParams, error } = action;
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);
    const { permissions } = useServiceAccountAccessMatrix(
        actorId,
        projectId,
        executionParams.environment as string,
    );

    const actionDefinition = ACTIONS.get(actionName);

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
                ({ permission, environment }) =>
                    permission === requiredPermission &&
                    environment === actionEnvironment,
            ),
        );
    }, [actionDefinition, permissions]);

    useEffect(() => {
        stateChanged({
            ...action,
            error: undefined,
        });
        if (
            actionDefinition?.required.some(
                (required) => !executionParams[required],
            )
        ) {
            stateChanged({
                ...action,
                error: 'Please fill all required fields.',
            });
        }
    }, [actionDefinition, executionParams]);

    const environments = project.environments.map(
        ({ environment }) => environment,
    );

    const { features } = useFeatureSearch({ project: `IS:${projectId}` });

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

    return (
        <ProjectActionsFormItem index={index} header={header} separator='THEN'>
            <StyledItemBody>
                <StyledItemRow>
                    <StyledFieldContainer>
                        <GeneralSelect
                            label='Action'
                            name='action'
                            options={[...ACTIONS].map(([key, { label }]) => ({
                                key,
                                label,
                            }))}
                            value={actionName}
                            onChange={(selected) =>
                                stateChanged({
                                    ...action,
                                    action: selected,
                                })
                            }
                            fullWidth
                        />
                    </StyledFieldContainer>
                    <StyledFieldContainer>
                        <GeneralSelect
                            label='Environment'
                            name='environment'
                            options={environments.map((environment) => ({
                                label: environment,
                                key: environment,
                            }))}
                            value={executionParams.environment as string}
                            onChange={(selected) =>
                                stateChanged({
                                    ...action,
                                    executionParams: {
                                        ...executionParams,
                                        environment: selected,
                                    },
                                })
                            }
                            fullWidth
                        />
                    </StyledFieldContainer>
                    <StyledFieldContainer>
                        <GeneralSelect
                            label='Flag name'
                            name='flag'
                            options={features.map((feature) => ({
                                label: feature.name,
                                key: feature.name,
                            }))}
                            value={executionParams.featureName as string}
                            onChange={(selected) =>
                                stateChanged({
                                    ...action,
                                    executionParams: {
                                        ...executionParams,
                                        featureName: selected,
                                    },
                                })
                            }
                            fullWidth
                        />
                    </StyledFieldContainer>
                </StyledItemRow>
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
