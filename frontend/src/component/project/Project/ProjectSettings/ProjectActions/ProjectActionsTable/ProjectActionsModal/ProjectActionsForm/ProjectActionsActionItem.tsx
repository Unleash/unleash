import { IconButton, Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Fragment } from 'react';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { Delete } from '@mui/icons-material';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    BoxSeparator,
    StyledCol,
    StyledInnerBoxHeader,
    StyledRow,
    StyledInnerBox,
} from './InnerContainerBox';
import { ActionsActionState } from './useProjectActionsForm';

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
    const environments = useProjectEnvironments(projectId);
    const { features } = useFeatureSearch({ project: `IS:${projectId}` });
    return (
        <Fragment>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator>THEN</BoxSeparator>}
            />
            <StyledInnerBox>
                <StyledRow>
                    <span>Action {index + 1}</span>
                    <StyledInnerBoxHeader>
                        <Tooltip title='Delete action' arrow>
                            <IconButton onClick={onDelete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </StyledInnerBoxHeader>
                </StyledRow>
                <StyledRow>
                    <StyledCol>
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
                    </StyledCol>
                    <StyledCol>
                        <GeneralSelect
                            label='Environment'
                            name='environment'
                            options={environments.environments.map((env) => ({
                                label: env.name,
                                key: env.name,
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
                    </StyledCol>
                    <StyledCol>
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
                    </StyledCol>
                </StyledRow>
            </StyledInnerBox>
        </Fragment>
    );
};
