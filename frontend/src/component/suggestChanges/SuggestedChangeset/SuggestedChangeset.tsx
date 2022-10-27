import { FC } from 'react';
import { Box } from '@mui/material';
import { SuggestedFeatureToggleChange } from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/SuggestedFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ToggleStatusChange } from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/ToggleStatusChange';
// import {
//     StrategyAddedChange,
//     StrategyDeletedChange,
//     StrategyEditedChange,
// } from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/StrategyChange';
// import {
//     formatStrategyName,
//     GetFeatureStrategyIcon,
// } from 'utils/strategyNames';
import type { ISuggestChangesResponse } from 'hooks/api/getters/useSuggestedChangesDraft/useSuggestedChangesDraft';

export const SuggestedChangeset: FC<{
    suggestedChange: ISuggestChangesResponse;
}> = ({ suggestedChange }) => {
    return (
        <Box>
            Changes
            {suggestedChange.features?.map(featureToggleChange => (
                <SuggestedFeatureToggleChange
                    key={featureToggleChange.name}
                    featureToggleName={featureToggleChange.name}
                >
                    {featureToggleChange.changes.map(change => (
                        <Box key={objectId(change)}>
                            <ConditionallyRender
                                condition={change.action === 'updateEnabled'}
                                show={
                                    <ToggleStatusChange
                                        enabled={change?.payload?.enabled}
                                    />
                                }
                            />
                            {/* <ConditionallyRender
                                condition={change.action === 'addStrategy'}
                                show={
                                    <StrategyAddedChange>
                                        <GetFeatureStrategyIcon
                                            strategyName={change.payload.name}
                                        />
                                        {formatStrategyName(
                                            change.payload.name
                                        )}
                                    </StrategyAddedChange>
                                }
                            />
                            <ConditionallyRender
                                condition={change.action === 'deleteStrategy'}
                                show={<StrategyDeletedChange />}
                            />
                            <ConditionallyRender
                                condition={change.action === 'updateStrategy'}
                                show={<StrategyEditedChange />}
                            /> */}
                        </Box>
                    ))}
                </SuggestedFeatureToggleChange>
            ))}
        </Box>
    );
};
