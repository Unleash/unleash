import { IconButton, Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IAction } from 'interfaces/action';
import { Fragment } from 'react';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { Delete } from '@mui/icons-material';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import mapValues from 'lodash.mapvalues';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    BoxSeparator,
    Col,
    InnerBoxHeader,
    Row,
    StyledInnerBox,
} from './InnerContainerBox';

export type UIAction = Omit<IAction, 'id' | 'createdAt' | 'createdByUserId'> & {
    id: string;
};

export const ActionItem = ({
    action,
    index,
    stateChanged,
    onDelete,
}: {
    action: UIAction;
    index: number;
    stateChanged: (action: UIAction) => void;
    onDelete: () => void;
}) => {
    const { id, action: actionName } = action;
    const projectId = useRequiredPathParam('projectId');
    const environments = useProjectEnvironments(projectId);
    const { features } = useFeatureSearch(
        mapValues(
            {
                project: `IS:${projectId}`,
            },
            (value) => (value ? `${value}` : undefined),
        ),
        {},
    );
    return (
        <Fragment>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator>THEN</BoxSeparator>}
            />
            <StyledInnerBox>
                <Row>
                    <span>Action {index + 1}</span>
                    <InnerBoxHeader>
                        <Tooltip title='Delete action' arrow>
                            <IconButton type='button' onClick={onDelete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </InnerBoxHeader>
                </Row>
                <Row>
                    <Col>
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
                    </Col>
                    <Col>
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
                    </Col>
                    <Col>
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
                    </Col>
                </Row>
            </StyledInnerBox>
        </Fragment>
    );
};
