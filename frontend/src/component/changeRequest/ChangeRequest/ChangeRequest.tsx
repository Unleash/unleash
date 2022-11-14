import { VFC } from 'react';
import { Box } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ToggleStatusChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ToggleStatusChange';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import type { IChangeRequest } from '../changeRequest.types';
import {
    StrategyAddedChange,
    StrategyDeletedChange,
    StrategyEditedChange,
} from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/StrategyChange';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from 'utils/strategyNames';
import { hasNameField } from '../changeRequest.types';

interface IChangeRequestProps {
    changeRequest: IChangeRequest;
    onRefetch?: () => void;
    onNavigate?: () => void;
}

export const ChangeRequest: VFC<IChangeRequestProps> = ({
    changeRequest,
    onRefetch,
    onNavigate,
}) => {
    const { discardChangeRequestEvent } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();
    const onDiscard = (id: number) => async () => {
        try {
            await discardChangeRequestEvent(
                changeRequest.project,
                changeRequest.id,
                id
            );
            setToastData({
                title: 'Change discarded from change request draft.',
                type: 'success',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Box>
            {changeRequest.features?.map(featureToggleChange => (
                <ChangeRequestFeatureToggleChange
                    key={featureToggleChange.name}
                    featureName={featureToggleChange.name}
                    projectId={changeRequest.project}
                    onNavigate={onNavigate}
                >
                    {featureToggleChange.changes.map(change => (
                        <Box
                            key={objectId(change)}
                            sx={theme => ({
                                padding: 2,
                                borderTop: '1px solid',
                                borderColor: theme =>
                                    theme.palette.dividerAlternative,
                            })}
                        >
                            {change.action === 'updateEnabled' && (
                                <ToggleStatusChange
                                    enabled={change.payload.enabled}
                                    onDiscard={onDiscard(change.id)}
                                />
                            )}
                            {change.action === 'addStrategy' && (
                                <StrategyAddedChange
                                    onDiscard={onDiscard(change.id)}
                                >
                                    <GetFeatureStrategyIcon
                                        strategyName={change.payload.name}
                                    />

                                    {formatStrategyName(change.payload.name)}
                                </StrategyAddedChange>
                            )}
                            {change.action === 'deleteStrategy' && (
                                <StrategyDeletedChange
                                    onDiscard={onDiscard(change.id)}
                                >
                                    {hasNameField(change.payload) && (
                                        <>
                                            <GetFeatureStrategyIcon
                                                strategyName={
                                                    change.payload.name
                                                }
                                            />
                                            {formatStrategyName(
                                                change.payload.name
                                            )}
                                        </>
                                    )}
                                </StrategyDeletedChange>
                            )}
                            {change.action === 'updateStrategy' && (
                                <StrategyEditedChange
                                    onDiscard={onDiscard(change.id)}
                                >
                                    <GetFeatureStrategyIcon
                                        strategyName={change.payload.name}
                                    />
                                    {formatStrategyName(change.payload.name)}
                                </StrategyEditedChange>
                            )}
                        </Box>
                    ))}
                </ChangeRequestFeatureToggleChange>
            ))}
        </Box>
    );
};
