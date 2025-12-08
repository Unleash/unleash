import type { VFC } from 'react';
import { Box, Typography } from '@mui/material';
import type {
    ChangeRequestType,
    IChangeRequestFeature,
    DisplayFeatureChange,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
} from '../changeRequest.types';
import { FeatureToggleChanges } from './Changes/FeatureToggleChanges.tsx';
import { FeatureChange } from './Changes/Change/FeatureChange.tsx';
import { ChangeActions } from './Changes/Change/ChangeActions.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SegmentChange } from './Changes/Change/SegmentChange.tsx';

/**
 * Partitions feature changes into processed changes, consolidating milestone progression changes
 */
const partitionFeatureChanges = (
    feature: IChangeRequestFeature,
): DisplayFeatureChange[] => {
    const progressionChanges = feature.changes.filter(
        (
            c,
        ): c is
            | IChangeRequestChangeMilestoneProgression
            | IChangeRequestDeleteMilestoneProgression =>
            c.action === 'changeMilestoneProgression' ||
            c.action === 'deleteMilestoneProgression',
    );

    const otherChanges = feature.changes.filter(
        (c) =>
            c.action !== 'changeMilestoneProgression' &&
            c.action !== 'deleteMilestoneProgression',
    );

    // Create processed changes list
    return [
        ...otherChanges,
        // Always consolidate progression changes if any exist (even if just one)
        ...(progressionChanges.length > 0
            ? [
                  {
                      type: 'consolidatedProgression' as const,
                      changes: progressionChanges,
                  },
              ]
            : []),
    ];
};

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
                        You request changes for these feature flags:
                    </Typography>
                }
            />
            {changeRequest.features?.map((feature) => {
                const featureChanges = partitionFeatureChanges(feature);

                return (
                    <FeatureToggleChanges
                        key={feature.name}
                        featureName={feature.name}
                        projectId={changeRequest.project}
                        onNavigate={onNavigate}
                        conflict={feature.conflict}
                    >
                        {featureChanges.map((change, index) => (
                            <FeatureChange
                                key={index}
                                actions={(() => {
                                    // For consolidated changes, use first change for actions
                                    const changeForActions =
                                        'type' in change &&
                                        change.type ===
                                            'consolidatedProgression'
                                            ? change.changes[0]
                                            : 'action' in change
                                              ? change
                                              : null;

                                    return changeForActions ? (
                                        <ChangeActions
                                            changeRequest={changeRequest}
                                            feature={feature.name}
                                            change={changeForActions}
                                            onRefetch={onRefetch}
                                        />
                                    ) : null;
                                })()}
                                index={index}
                                changeRequest={changeRequest}
                                change={change}
                                feature={feature}
                                onNavigate={onNavigate}
                                onRefetch={onRefetch}
                            />
                        ))}
                        {feature.defaultChange ? (
                            <FeatureChange
                                isDefaultChange
                                index={feature.changes.length}
                                changeRequest={changeRequest}
                                change={feature.defaultChange}
                                feature={feature}
                            />
                        ) : null}
                    </FeatureToggleChanges>
                );
            })}
        </Box>
    );
};
