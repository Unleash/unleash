import React, { FC, VFC } from 'react';
import { Alert, Box, Popover, styled, Typography } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ToggleStatusChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ToggleStatusChange';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import type {
    IChangeRequest,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from '../changeRequest.types';
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
import {
    hasNameField,
    IChangeRequestAddStrategy,
} from '../changeRequest.types';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import EventDiff from '../../events/EventDiff/EventDiff';

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

const CodeSnippetPopover: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
}> = ({ change }) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <GetFeatureStrategyIcon strategyName={change.payload.name} />

            <Typography
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                {formatStrategyName(change.payload.name)}
            </Typography>
            <Popover
                id={String(change.id)}
                sx={{
                    pointerEvents: 'none',
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Box sx={{ paddingLeft: 3, paddingRight: 3 }}>
                    <EventDiff
                        entry={{
                            data: change.payload,
                        }}
                    />
                </Box>
            </Popover>
        </>
    );
};

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
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(
        changeRequest.project
    );
    const allowChangeRequestActions = isChangeRequestConfigured(
        changeRequest.environment
    );

    const showDiscard =
        allowChangeRequestActions &&
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
                                        <CodeSnippetPopover change={change} />
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
                                            <CodeSnippetPopover
                                                change={change}
                                            />
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
                                        <CodeSnippetPopover change={change} />
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
