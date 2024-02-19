import { VFC } from 'react';
import { Box, Typography } from '@mui/material';
import type { ChangeRequestType } from '../changeRequest.types';
import { FeatureToggleChanges } from './Changes/FeatureToggleChanges';
import { FeatureChange } from './Changes/Change/FeatureChange';
import { ChangeActions } from './Changes/Change/ChangeActions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SegmentChange } from './Changes/Change/SegmentChange';

interface IChangeRequestProps {
    changeRequest: ChangeRequestType;
    onRefetch?: () => void;
    onNavigate?: () => void;
}

export const ChangeRequest: VFC<IChangeRequestProps> = ({
    changeRequest,
    onRefetch,
    onNavigate,
}) => {
    return (
        <Box>
            <ConditionallyRender
                condition={changeRequest.segments.length > 0}
                show={
                    <Typography variant='body2' color='text.secondary'>
                        You request changes for these segments:
                    </Typography>
                }
            />

            {changeRequest.segments?.map((segmentChange) => (
                <SegmentChange
                    key={segmentChange.payload.id}
                    segmentChange={segmentChange}
                    onNavigate={onNavigate}
                    changeRequestState={changeRequest.state}
                    actions={
                        <ChangeActions
                            changeRequest={changeRequest}
                            feature={'Unused'}
                            change={segmentChange}
                            onRefetch={onRefetch}
                        />
                    }
                />
            ))}
            <ConditionallyRender
                condition={changeRequest.features.length > 0}
                show={
                    <Typography variant='body2' color='text.secondary'>
                        You request changes for these feature toggles:
                    </Typography>
                }
            />
            {changeRequest.features?.map((feature) => (
                <FeatureToggleChanges
                    key={feature.name}
                    featureName={feature.name}
                    projectId={changeRequest.project}
                    onNavigate={onNavigate}
                    conflict={feature.conflict}
                >
                    {feature.changes.map((change, index) => (
                        <FeatureChange
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            key={index}
                            actions={
                                <ChangeActions
                                    changeRequest={changeRequest}
                                    feature={feature.name}
                                    change={change}
                                    onRefetch={onRefetch}
                                />
                            }
                            index={index}
                            changeRequest={changeRequest}
                            change={change}
                            feature={feature}
                            onNavigate={onNavigate}
                        />
                    ))}
                    {feature.defaultChange ? (
                        <FeatureChange
                            actions={
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    {feature.defaultChange.action ===
                                    'addStrategy'
                                        ? 'Default strategy will be added'
                                        : 'Feature status will change'}
                                </Typography>
                            }
                            index={feature.changes.length}
                            changeRequest={changeRequest}
                            change={feature.defaultChange}
                            feature={feature}
                        />
                    ) : null}
                </FeatureToggleChanges>
            ))}
        </Box>
    );
};
