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
import { useMemo } from 'react';

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

const options = [
    {
        label: 'Enable flag',
        key: 'TOGGLE_FEATURE_ON',
        permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
    },
    {
        label: 'Disable flag',
        key: 'TOGGLE_FEATURE_OFF',
        permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
    },
];

interface IProjectActionsItemProps {
    action: ActionsActionState;
    index: number;
    stateChanged: (action: ActionsActionState) => void;
    actorId: number;
    onDelete: () => void;
}

export const ProjectActionsActionItem = ({
    action,
    index,
    stateChanged,
    actorId,
    onDelete,
}: IProjectActionsItemProps) => {
    const { action: actionName } = action;
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);
    const { permissions } = useServiceAccountAccessMatrix(
        actorId,
        projectId,
        action.executionParams.environment as string,
    );

    const hasPermission = useMemo(() => {
        const requiredPermissions = options.find(
            ({ key }) => key === actionName,
        )?.permissions;

        const { environment: actionEnvironment } = action.executionParams;

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
    }, [actionName, permissions]);

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
                            options={options}
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
                            value={action.executionParams.environment as string}
                            onChange={(selected) =>
                                stateChanged({
                                    ...action,
                                    executionParams: {
                                        ...action.executionParams,
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
                            value={action.executionParams.featureName as string}
                            onChange={(selected) =>
                                stateChanged({
                                    ...action,
                                    executionParams: {
                                        ...action.executionParams,
                                        featureName: selected,
                                    },
                                })
                            }
                            fullWidth
                        />
                    </StyledFieldContainer>
                </StyledItemRow>
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
