import { IconButton, Tooltip, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { Delete } from '@mui/icons-material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { ActionsActionState } from './useProjectActionsForm';
import { ProjectActionsFormItem } from './ProjectActionsFormItem';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

const StyledItemRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
}));

const StyledFieldContainer = styled('div')({
    flex: 1,
});

export const ProjectActionsActionItem = ({
    action,
    index,
    stateChanged,
    onDelete,
}: {
    action: ActionsActionState;
    index: number;
    stateChanged: (action: ActionsActionState) => void;
    onDelete: () => void;
}) => {
    const { action: actionName } = action;
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);

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
            <StyledItemRow>
                <StyledFieldContainer>
                    <GeneralSelect
                        label='Action'
                        name='action'
                        options={[
                            {
                                label: 'Enable flag',
                                key: 'TOGGLE_FEATURE_ON',
                            },
                            {
                                label: 'Disable flag',
                                key: 'TOGGLE_FEATURE_OFF',
                            },
                        ]}
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
        </ProjectActionsFormItem>
    );
};
