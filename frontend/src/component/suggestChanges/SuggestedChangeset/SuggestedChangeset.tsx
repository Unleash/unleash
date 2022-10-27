import { FC } from 'react';
import { Box } from '@mui/material';
import { SuggestedFeatureToggleChange } from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/SuggestedFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ToggleStatusChange } from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/ToggleStatusChange';
import {
    StrategyAddedChange,
    StrategyDeletedChange,
    StrategyEditedChange,
} from '../SuggestedChangeOverview/SuggestedFeatureToggleChange/StrategyChange';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from 'utils/strategyNames';

export const SuggestedChangeset: FC<{ suggestedChange: any }> = ({
    suggestedChange,
}) => {
    return (
        <Box>
            Changes
            {suggestedChange.changes?.map((featureToggleChange: any) => (
                <SuggestedFeatureToggleChange
                    key={featureToggleChange.feature}
                    featureToggleName={featureToggleChange.feature}
                >
                    {featureToggleChange.changeSet.map((change: any) => (
                        <Box key={objectId(change)}>
                            <ConditionallyRender
                                condition={change.action === 'updateEnabled'}
                                show={
                                    <ToggleStatusChange
                                        enabled={change?.payload?.data?.data}
                                    />
                                }
                            />
                            <ConditionallyRender
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
                            />
                        </Box>
                    ))}
                </SuggestedFeatureToggleChange>
            ))}
        </Box>
    );
};
