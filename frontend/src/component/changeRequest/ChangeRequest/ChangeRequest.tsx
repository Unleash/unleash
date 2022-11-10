import { VFC } from 'react';
import { Alert, Box } from '@mui/material';
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
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
                    conflict={featureToggleChange.conflict}
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
                            <ConditionallyRender
                                condition={Boolean(change.conflict)}
                                show={
                                    <Alert severity="warning" sx={{ mb: 1 }}>
                                        <strong>Conflict!</strong> This change
                                        can’t be applied. {change.conflict}.
                                    </Alert>
                                }
                            />
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
