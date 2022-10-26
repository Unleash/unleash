import { FC } from 'react';
import { Box, Paper } from '@mui/material';
import { SuggestedFeatureToggleChange } from '../SuggestedFeatureToggleChange/SuggestedFeatureToggleChange';
import { objectId } from '../../../../../../utils/objectId';
import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { ToggleStatusChange } from '../SuggestedFeatureToggleChange/ToggleStatusChange';
import {
    StrategyAddedChange,
    StrategyDeletedChange,
    StrategyEditedChange,
} from '../SuggestedFeatureToggleChange/StrategyChange';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from '../../../../../../utils/strategyNames';

export const SuggestedChangeSet: FC<{ suggestedChange: any }> = ({
    suggestedChange,
}) => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                marginLeft: theme.spacing(2),
                width: '70%',
                padding: 2,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <Box
                sx={theme => ({
                    padding: theme.spacing(2),
                })}
            >
                Changes
                {suggestedChange.changes?.map((featureToggleChange: any) => (
                    <SuggestedFeatureToggleChange
                        key={featureToggleChange.feature}
                        featureToggleName={featureToggleChange.feature}
                    >
                        {featureToggleChange.changeSet.map((change: any) => (
                            <Box key={objectId(change)}>
                                <ConditionallyRender
                                    condition={
                                        change.action === 'updateEnabled'
                                    }
                                    show={
                                        <ToggleStatusChange
                                            enabled={
                                                change?.payload?.data?.data
                                            }
                                        />
                                    }
                                />
                                <ConditionallyRender
                                    condition={change.action === 'addStrategy'}
                                    show={
                                        <StrategyAddedChange>
                                            <GetFeatureStrategyIcon
                                                strategyName={
                                                    change.payload.name
                                                }
                                            />
                                            {formatStrategyName(
                                                change.payload.name
                                            )}
                                        </StrategyAddedChange>
                                    }
                                />
                                <ConditionallyRender
                                    condition={
                                        change.action === 'deleteStrategy'
                                    }
                                    show={<StrategyDeletedChange />}
                                />
                                <ConditionallyRender
                                    condition={
                                        change.action === 'updateStrategy'
                                    }
                                    show={<StrategyEditedChange />}
                                />
                            </Box>
                        ))}
                    </SuggestedFeatureToggleChange>
                ))}
            </Box>
        </Paper>
    );
};
