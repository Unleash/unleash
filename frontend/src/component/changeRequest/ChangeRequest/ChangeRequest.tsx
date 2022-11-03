import { VFC } from 'react';
import { Box } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
} from '../../../utils/strategyNames';
import { IFeatureStrategyPayload } from '../../../interfaces/strategy';

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
                        <Box key={objectId(change)}>
                            <ConditionallyRender
                                condition={change.action === 'updateEnabled'}
                                show={
                                    <ToggleStatusChange
                                        enabled={
                                            (change?.payload as any)?.enabled
                                        }
                                        onDiscard={onDiscard(change.id)}
                                    />
                                }
                            />
                            <ConditionallyRender
                                condition={change.action === 'addStrategy'}
                                show={
                                    <StrategyAddedChange>
                                        <GetFeatureStrategyIcon
                                            strategyName={
                                                (
                                                    change.payload as IFeatureStrategyPayload
                                                )?.name!
                                            }
                                        />
                                        {formatStrategyName(
                                            (
                                                change.payload as IFeatureStrategyPayload
                                            )?.name!
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
                </ChangeRequestFeatureToggleChange>
            ))}
        </Box>
    );
};
