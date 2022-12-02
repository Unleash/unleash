import React, { FC, VFC } from 'react';
import { Alert, Box, styled } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import { objectId } from 'utils/objectId';
import { ToggleStatusChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ToggleStatusChange';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import type {
    IChange,
    IChangeRequest,
    IChangeRequestFeature,
} from '../changeRequest.types';
import { hasNameField } from '../changeRequest.types';
import {
    Discard,
    StrategyAddedChange,
    StrategyDeletedChange,
    StrategyEditedChange,
} from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/StrategyChange';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { StrategyExecution } from '../../feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import {
    CodeSnippetPopover,
    PopoverDiff,
} from './CodeSnippetPopover/CodeSnippetPopover';

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

const Change: FC<{
    onDiscard: () => Promise<void>;
    index: number;
    changeRequest: IChangeRequest;
    change: IChange;
    feature: IChangeRequestFeature;
}> = ({ index, change, feature, changeRequest, onDiscard }) => {
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
        <StyledSingleChangeBox
            key={objectId(change)}
            $hasConflict={Boolean(change.conflict)}
            $isInConflictFeature={Boolean(feature.conflict)}
            $isAfterWarning={Boolean(feature.changes[index - 1]?.conflict)}
            $isLast={index + 1 === feature.changes.length}
        >
            <ConditionallyRender
                condition={Boolean(change.conflict) && !feature.conflict}
                show={
                    <StyledAlert severity="warning">
                        <strong>Conflict!</strong> This change can’t be applied.{' '}
                        {change.conflict}.
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
                                show={<Discard onDiscard={onDiscard} />}
                            />
                        }
                    />
                )}
                {change.action === 'addStrategy' && (
                    <>
                        <StrategyAddedChange
                            discard={
                                <ConditionallyRender
                                    condition={showDiscard}
                                    show={<Discard onDiscard={onDiscard} />}
                                />
                            }
                        >
                            <CodeSnippetPopover change={change}>
                                <PopoverDiff
                                    change={change}
                                    feature={feature.name}
                                    environmentName={changeRequest.environment}
                                    project={changeRequest.project}
                                />
                            </CodeSnippetPopover>
                        </StrategyAddedChange>
                        <StrategyExecution strategy={change.payload} />
                    </>
                )}
                {change.action === 'deleteStrategy' && (
                    <StrategyDeletedChange
                        discard={
                            <ConditionallyRender
                                condition={showDiscard}
                                show={<Discard onDiscard={onDiscard} />}
                            />
                        }
                    >
                        {hasNameField(change.payload) && (
                            <CodeSnippetPopover change={change}>
                                <PopoverDiff
                                    change={change}
                                    feature={feature.name}
                                    environmentName={changeRequest.environment}
                                    project={changeRequest.project}
                                />
                            </CodeSnippetPopover>
                        )}
                    </StrategyDeletedChange>
                )}
                {change.action === 'updateStrategy' && (
                    <>
                        <StrategyEditedChange
                            discard={
                                <ConditionallyRender
                                    condition={showDiscard}
                                    show={<Discard onDiscard={onDiscard} />}
                                />
                            }
                        >
                            <CodeSnippetPopover change={change}>
                                <PopoverDiff
                                    change={change}
                                    feature={feature.name}
                                    environmentName={changeRequest.environment}
                                    project={changeRequest.project}
                                />
                            </CodeSnippetPopover>
                        </StrategyEditedChange>
                        <StrategyExecution strategy={change.payload} />
                    </>
                )}
            </Box>
        </StyledSingleChangeBox>
    );
};

export const ChangeRequest: VFC<IChangeRequestProps> = ({
    changeRequest,
    onRefetch,
    onNavigate,
}) => {
    const { discardChange } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();
    const onDiscard = (id: number) => async () => {
        try {
            await discardChange(changeRequest.project, changeRequest.id, id);
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
            {changeRequest.features?.map(feature => (
                <ChangeRequestFeatureToggleChange
                    key={feature.name}
                    featureName={feature.name}
                    projectId={changeRequest.project}
                    onNavigate={onNavigate}
                    conflict={feature.conflict}
                >
                    {feature.changes.map((change, index) => (
                        <Change
                            key={index}
                            onDiscard={onDiscard(change.id)}
                            index={index}
                            changeRequest={changeRequest}
                            change={change}
                            feature={feature}
                        />
                    ))}
                </ChangeRequestFeatureToggleChange>
            ))}
        </Box>
    );
};
