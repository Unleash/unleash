import { useCallback, VFC } from 'react';
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
import { useSuggestChangeApi } from 'hooks/api/actions/useSuggestChangeApi/useSuggestChangeApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';

interface ISuggestedChangeset {
    suggestedChange: ISuggestChangesResponse;
    onRefetch?: () => void;
    onNavigate?: () => void;
}

export const SuggestedChangeset: VFC<ISuggestedChangeset> = ({
    suggestedChange,
    onRefetch,
    onNavigate,
}) => {
    const { discardSuggestions } = useSuggestChangeApi();
    const { setToastData, setToastApiError } = useToast();
    const onDiscard = (id: number) => async () => {
        try {
            await discardSuggestions(suggestedChange.project, suggestedChange.id, id);
            setToastData({
                title: 'Change discarded from suggestion draft.',
                type: 'success',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Box>
            Changes
            {suggestedChange.features?.map(featureToggleChange => (
                <SuggestedFeatureToggleChange
                    key={featureToggleChange.name}
                    featureName={featureToggleChange.name}
                    projectId={suggestedChange.project}
                    onNavigate={onNavigate}
                >
                    {featureToggleChange.changes.map(change => (
                        <Box key={objectId(change)}>
                            <ConditionallyRender
                                condition={change.action === 'updateEnabled'}
                                show={
                                    <ToggleStatusChange
                                        enabled={change?.payload?.enabled}
                                        onDiscard={onDiscard(change.id)}
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
