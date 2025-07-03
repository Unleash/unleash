import type { FC, ReactNode } from 'react';
import type {
    IFeatureChange,
    ChangeRequestType,
    IChangeRequestFeature,
} from '../../../changeRequest.types';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, styled } from '@mui/material';
import {
    LegacyToggleStatusChange,
    ToggleStatusChange,
} from './ToggleStatusChange.tsx';
import { LegacyStrategyChange } from './LegacyStrategyChange.tsx';
import { VariantPatch } from './VariantPatch/VariantPatch.tsx';
import { EnvironmentStrategyExecutionOrder } from './EnvironmentStrategyExecutionOrder/EnvironmentStrategyExecutionOrder.tsx';
import {
    ArchiveFeatureChange,
    LegacyArchiveFeatureChange,
} from './ArchiveFeatureChange.tsx';
import {
    DependencyChange,
    LegacyDependencyChange,
} from './DependencyChange.tsx';
import { Link } from 'react-router-dom';
import { LegacyReleasePlanChange } from './LegacyReleasePlanChange.tsx';
import { ReleasePlanChange } from './ReleasePlanChange.tsx';
import { StrategyChange } from './StrategyChange.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

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
        overflow: 'hidden',
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
                : theme.palette.divider,
        borderTopColor:
            ($hasConflict || $isAfterWarning) && !$isInConflictFeature
                ? theme.palette.warning.border
                : theme.palette.divider,
    }),
);

const StyledAlert = styled(Alert)(({ theme }) => ({
    borderRadius: 0,
    padding: theme.spacing(1, 2),
    '&.MuiAlert-standardWarning': {
        borderStyle: 'none none solid none',
    },
}));

const InlineList = styled('ul')(({ theme }) => ({
    display: 'inline',
    padding: 0,
    li: { display: 'inline' },
    'li + li::before': {
        content: '", "',
    },
}));

const ChangeInnerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    // todo: remove with flag crDiffView
    '&:has(.delete-strategy-information-wrapper)': {
        backgroundColor: theme.palette.error.light,
    },
}));

export const FeatureChange: FC<{
    isDefaultChange?: boolean;
    actions?: ReactNode;
    index: number;
    changeRequest: ChangeRequestType;
    change: IFeatureChange;
    feature: IChangeRequestFeature;
    onNavigate?: () => void;
}> = ({ index, change, feature, changeRequest, actions, onNavigate }) => {
    const lastIndex = feature.defaultChange
        ? feature.changes.length + 1
        : feature.changes.length;

    const useDiffableChangeComponent = useUiFlag('crDiffView');
    const StrategyChangeComponent = useDiffableChangeComponent
        ? StrategyChange
        : LegacyStrategyChange;

    const ReleasePlanChangeComponent = useDiffableChangeComponent
        ? ReleasePlanChange
        : LegacyReleasePlanChange;

    const ArchiveFlagComponent = useDiffableChangeComponent
        ? ArchiveFeatureChange
        : LegacyArchiveFeatureChange;

    const DependencyChangeComponent = useDiffableChangeComponent
        ? DependencyChange
        : LegacyDependencyChange;

    const StatusChangeComponent = useDiffableChangeComponent
        ? ToggleStatusChange
        : LegacyToggleStatusChange;

    return (
        <StyledSingleChangeBox
            key={objectId(change)}
            $hasConflict={Boolean(change.conflict || change.scheduleConflicts)}
            $isInConflictFeature={Boolean(feature.conflict)}
            $isAfterWarning={Boolean(
                feature.changes[index - 1]?.conflict ||
                    feature.changes[index - 1]?.scheduleConflicts,
            )}
            $isLast={index + 1 === lastIndex}
        >
            <ConditionallyRender
                condition={Boolean(change.conflict) && !feature.conflict}
                show={
                    <StyledAlert severity='warning'>
                        <strong>Conflict!</strong> This change can’t be applied.{' '}
                        {change.conflict}.
                    </StyledAlert>
                }
            />

            <ConditionallyRender
                condition={Boolean(change.scheduleConflicts)}
                show={
                    <StyledAlert severity='warning'>
                        <strong>Potential conflict!</strong> This change would
                        create conflicts with the following scheduled change
                        request(s):{' '}
                        <InlineList>
                            {(
                                change.scheduleConflicts ?? {
                                    changeRequests: [],
                                }
                            ).changeRequests.map(({ id, title }) => {
                                const text = title
                                    ? `#${id} (${title})`
                                    : `#${id}`;
                                return (
                                    <li key={id}>
                                        <Link
                                            to={`/projects/${changeRequest.project}/change-requests/${id}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            title={`Change request ${id}`}
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                );
                            })}
                            .
                        </InlineList>
                    </StyledAlert>
                }
            />

            <ChangeInnerBox>
                {(change.action === 'addDependency' ||
                    change.action === 'deleteDependency') && (
                    <DependencyChangeComponent
                        actions={actions}
                        change={change}
                        projectId={changeRequest.project}
                        onNavigate={onNavigate}
                    />
                )}
                {change.action === 'updateEnabled' && (
                    <StatusChangeComponent
                        isDefaultChange
                        enabled={change.payload.enabled}
                        actions={actions}
                    />
                )}
                {change.action === 'archiveFeature' && (
                    <ArchiveFlagComponent actions={actions} />
                )}

                {change.action === 'addStrategy' ||
                change.action === 'deleteStrategy' ||
                change.action === 'updateStrategy' ? (
                    <StrategyChangeComponent
                        actions={actions}
                        change={change}
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                        changeRequestState={changeRequest.state}
                    />
                ) : null}
                {change.action === 'patchVariant' && (
                    <VariantPatch
                        feature={feature.name}
                        project={changeRequest.project}
                        changeRequestState={changeRequest.state}
                        environment={changeRequest.environment}
                        change={change}
                        actions={actions}
                    />
                )}
                {change.action === 'reorderStrategy' && (
                    <EnvironmentStrategyExecutionOrder
                        feature={feature.name}
                        project={changeRequest.project}
                        environment={changeRequest.environment}
                        change={change}
                        actions={actions}
                    />
                )}
                {(change.action === 'addReleasePlan' ||
                    change.action === 'deleteReleasePlan' ||
                    change.action === 'startMilestone') && (
                    <ReleasePlanChangeComponent
                        actions={actions}
                        change={change}
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                        changeRequestState={changeRequest.state}
                    />
                )}
            </ChangeInnerBox>
        </StyledSingleChangeBox>
    );
};
