import type { VFC } from 'react';
import { Box, Typography } from '@mui/material';
import type {
    ChangeRequestType,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestConsolidatedProgressionChange,
    IChangeRequestDeleteMilestoneProgression,
    IFeatureChange,
} from '../changeRequest.types';
import { FeatureToggleChanges } from './Changes/FeatureToggleChanges.tsx';
import { FeatureChange } from './Changes/Change/FeatureChange.tsx';
import { ChangeActions } from './Changes/Change/ChangeActions.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SegmentChange } from './Changes/Change/SegmentChange.tsx';

interface IChangeRequestProps {
    changeRequest: ChangeRequestType;
    onRefetch?: () => void;
    onNavigate?: () => void;
}

const toDisplayFeatureChanges = (
    changes: IFeatureChange[],
): IFeatureChange[] => {
    const consolidatedChange: IChangeRequestConsolidatedProgressionChange = {
        action: 'consolidatedProgression',
        changes: [],
        id: 0,
    };
    const regularChanges: Exclude<
        IFeatureChange,
        | IChangeRequestChangeMilestoneProgression
        | IChangeRequestDeleteMilestoneProgression
    >[] = [];

    changes.forEach((change) => {
        if (
            change.action === 'changeMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression'
        ) {
            consolidatedChange.changes.push(change);
            if (change.id && !consolidatedChange.id) {
                consolidatedChange.id = change.id;
            }
            if (change.conflict && !consolidatedChange.conflict) {
                consolidatedChange.conflict = change.conflict;
            }
            if (
                change.scheduleConflicts &&
                !consolidatedChange.scheduleConflicts
            ) {
                consolidatedChange.scheduleConflicts = change.scheduleConflicts;
            }
        } else {
            regularChanges.push(change);
        }
    });

    return [consolidatedChange, ...regularChanges];
};

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
                const displayChanges = toDisplayFeatureChanges(feature.changes);

                return (
                    <FeatureToggleChanges
                        key={feature.name}
                        featureName={feature.name}
                        projectId={changeRequest.project}
                        onNavigate={onNavigate}
                        conflict={feature.conflict}
                    >
                        {displayChanges.map((change, index) => (
                            <FeatureChange
                                key={change.id}
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
                                onRefetch={onRefetch}
                                isLast={
                                    !feature.defaultChange &&
                                    index === displayChanges.length - 1
                                }
                                isAfterWarning={
                                    index > 0 &&
                                    Boolean(
                                        displayChanges[index - 1]?.conflict ||
                                            displayChanges[index - 1]
                                                ?.scheduleConflicts,
                                    )
                                }
                            />
                        ))}
                        {feature.defaultChange ? (
                            <FeatureChange
                                isDefaultChange
                                index={displayChanges.length}
                                changeRequest={changeRequest}
                                change={feature.defaultChange}
                                feature={feature}
                                isLast={true}
                                isAfterWarning={
                                    displayChanges.length > 0 &&
                                    Boolean(
                                        displayChanges[
                                            displayChanges.length - 1
                                        ]?.conflict ||
                                            displayChanges[
                                                displayChanges.length - 1
                                            ]?.scheduleConflicts,
                                    )
                                }
                            />
                        ) : null}
                    </FeatureToggleChanges>
                );
            })}
        </Box>
    );
};
