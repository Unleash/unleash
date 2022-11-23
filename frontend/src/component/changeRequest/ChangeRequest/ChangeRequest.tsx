import { VFC } from 'react';
import { Alert, Box, styled } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ToggleStatusChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ToggleStatusChange';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import type { IChangeRequest } from '../changeRequest.types';
import {
    Discard,
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

const StyledSingleChangeBox = styled(Box, {
    shouldForwardProp: (prop: string) => !prop.startsWith('$'),
})<{
    $hasConflict: boolean;
    $isAfterWarning: boolean;
    $isLast: boolean;
    $isInConflictFeature: boolean;
}>(
    ({
        theme,
        $hasConflict,
        $isInConflictFeature,
        $isAfterWarning,
        $isLast,
    }) => ({
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderTop: '1px solid',
        borderBottom: $isLast ? '1px solid' : 'none',
        borderRadius: $isLast
            ? `0 0
                ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`
            : 0,
        borderColor:
            $hasConflict || $isInConflictFeature
                ? theme.palette.warning.border
                : theme.palette.dividerAlternative,
        borderTopColor:
            ($hasConflict || $isAfterWarning) && !$isInConflictFeature
                ? theme.palette.warning.border
                : theme.palette.dividerAlternative,
    })
);

const StyledAlert = styled(Alert)(({ theme }) => ({
    borderRadius: 0,
    padding: theme.spacing(0, 2),
    '&.MuiAlert-standardWarning': {
        borderStyle: 'none none solid none',
    },
}));

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

    const showDiscard =
        !['Cancelled', 'Applied'].includes(changeRequest.state) &&
        changeRequest.features.flatMap(feature => feature.changes).length > 1;

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
                    {featureToggleChange.changes.map((change, index) => (
                        <StyledSingleChangeBox
                            key={objectId(change)}
                            $hasConflict={Boolean(change.conflict)}
                            $isInConflictFeature={Boolean(
                                featureToggleChange.conflict
                            )}
                            $isAfterWarning={Boolean(
                                featureToggleChange.changes[index - 1]?.conflict
                            )}
                            $isLast={
                                index + 1 === featureToggleChange.changes.length
                            }
                        >
                            <ConditionallyRender
                                condition={
                                    Boolean(change.conflict) &&
                                    !featureToggleChange.conflict
                                }
                                show={
                                    <StyledAlert severity="warning">
                                        <strong>Conflict!</strong> This change
                                        can’t be applied. {change.conflict}.
                                    </StyledAlert>
                                }
                            />
                            <Box sx={{ p: 2 }}>
                                {change.action === 'updateEnabled' && (
                                    <ToggleStatusChange
                                        enabled={change.payload.enabled}
                                        discard={
                                            <ConditionallyRender
                                                condition={showDiscard}
                                                show={
                                                    <Discard
                                                        onDiscard={onDiscard(
                                                            change.id
                                                        )}
                                                    />
                                                }
                                            />
                                        }
                                    />
                                )}
                                {change.action === 'addStrategy' && (
                                    <StrategyAddedChange
                                        discard={
                                            <ConditionallyRender
                                                condition={showDiscard}
                                                show={
                                                    <Discard
                                                        onDiscard={onDiscard(
                                                            change.id
                                                        )}
                                                    />
                                                }
                                            />
                                        }
                                    >
                                        <GetFeatureStrategyIcon
                                            strategyName={change.payload.name}
                                        />

                                        {formatStrategyName(
                                            change.payload.name
                                        )}
                                    </StrategyAddedChange>
                                )}
                                {change.action === 'deleteStrategy' && (
                                    <StrategyDeletedChange
                                        discard={
                                            <ConditionallyRender
                                                condition={showDiscard}
                                                show={
                                                    <Discard
                                                        onDiscard={onDiscard(
                                                            change.id
                                                        )}
                                                    />
                                                }
                                            />
                                        }
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
                                        discard={
                                            <ConditionallyRender
                                                condition={showDiscard}
                                                show={
                                                    <Discard
                                                        onDiscard={onDiscard(
                                                            change.id
                                                        )}
                                                    />
                                                }
                                            />
                                        }
                                    >
                                        <GetFeatureStrategyIcon
                                            strategyName={change.payload.name}
                                        />
                                        {formatStrategyName(
                                            change.payload.name
                                        )}
                                    </StrategyEditedChange>
                                )}
                            </Box>
                        </StyledSingleChangeBox>
                    ))}
                </ChangeRequestFeatureToggleChange>
            ))}
        </Box>
    );
};
