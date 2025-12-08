import type { FC, ReactNode } from 'react';
import { objectId } from 'utils/objectId';
import type {
    ChangeRequestType,
    IChangeRequestFeature,
    DisplayFeatureChange,
} from '../../../changeRequest.types';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, styled } from '@mui/material';
import { ToggleStatusChange } from './ToggleStatusChange.tsx';
import { VariantPatch } from './VariantPatch/VariantPatch.tsx';
import { EnvironmentStrategyExecutionOrder } from './EnvironmentStrategyExecutionOrder/EnvironmentStrategyExecutionOrder.tsx';
import { ArchiveFeatureChange } from './ArchiveFeatureChange.tsx';
import { DependencyChange } from './DependencyChange.tsx';
import { Link } from 'react-router-dom';
import { ReleasePlanChange } from './ReleasePlanChange.tsx';
import { StrategyChange } from './StrategyChange.tsx';

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
}));

export const FeatureChange: FC<{
    actions?: ReactNode;
    index: number;
    changeRequest: ChangeRequestType;
    change: DisplayFeatureChange;
    feature: IChangeRequestFeature;
    onNavigate?: () => void;
    isDefaultChange?: boolean;
    onRefetch?: () => void;
}> = ({
    index,
    change,
    feature,
    changeRequest,
    actions,
    onNavigate,
    isDefaultChange,
    onRefetch,
}) => {
    const lastIndex = feature.defaultChange
        ? feature.changes.length + 1
        : feature.changes.length;

    const isConsolidated =
        'type' in change && change.type === 'consolidatedProgression';

    const hasConflict = isConsolidated
        ? Boolean(change.changes.some((c) => c.conflict || c.scheduleConflicts))
        : Boolean(
              'action' in change &&
                  (change.conflict || change.scheduleConflicts),
          );

    return (
        <StyledSingleChangeBox
            key={objectId(change)}
            $hasConflict={hasConflict}
            $isInConflictFeature={Boolean(feature.conflict)}
            $isAfterWarning={Boolean(
                feature.changes[index - 1]?.conflict ||
                    feature.changes[index - 1]?.scheduleConflicts,
            )}
            $isLast={index + 1 === lastIndex}
        >
            {isConsolidated ? (
                <ConditionallyRender
                    condition={
                        Boolean(change.changes.some((c) => c.conflict)) &&
                        !feature.conflict
                    }
                    show={
                        <StyledAlert severity='warning'>
                            <strong>Conflict!</strong> These changes can't be
                            applied.
                        </StyledAlert>
                    }
                />
            ) : (
                'action' in change && (
                    <>
                        <ConditionallyRender
                            condition={
                                Boolean(change.conflict) && !feature.conflict
                            }
                            show={
                                <StyledAlert severity='warning'>
                                    <strong>Conflict!</strong> This change can't
                                    be applied. {change.conflict}.
                                </StyledAlert>
                            }
                        />

                        <ConditionallyRender
                            condition={Boolean(change.scheduleConflicts)}
                            show={
                                <StyledAlert severity='warning'>
                                    <strong>Potential conflict!</strong> This
                                    change would create conflicts with the
                                    following scheduled change request(s):{' '}
                                    <InlineList>
                                        {(
                                            change.scheduleConflicts ?? {
                                                changeRequests: [],
                                            }
                                        ).changeRequests.map(
                                            ({ id, title }) => {
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
                                            },
                                        )}
                                        .
                                    </InlineList>
                                </StyledAlert>
                            }
                        />
                    </>
                )
            )}

            <ChangeInnerBox>
                {/* Render change content */}
                {isConsolidated ? (
                    <ReleasePlanChange
                        actions={actions}
                        change={change} // Pass the consolidated change directly
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                        changeRequestState={changeRequest.state}
                        onRefetch={onRefetch}
                    />
                ) : (
                    'action' in change && (
                        <>
                            {(change.action === 'addDependency' ||
                                change.action === 'deleteDependency') && (
                                <DependencyChange
                                    actions={actions}
                                    change={change}
                                    projectId={changeRequest.project}
                                    onNavigate={onNavigate}
                                />
                            )}
                            {change.action === 'updateEnabled' && (
                                <ToggleStatusChange
                                    isDefaultChange={isDefaultChange}
                                    enabled={change.payload.enabled}
                                    actions={actions}
                                />
                            )}
                            {change.action === 'archiveFeature' && (
                                <ArchiveFeatureChange actions={actions} />
                            )}

                            {(change.action === 'addStrategy' ||
                                change.action === 'deleteStrategy' ||
                                change.action === 'updateStrategy') && (
                                <StrategyChange
                                    actions={actions}
                                    isDefaultChange={isDefaultChange}
                                    change={change}
                                    featureName={feature.name}
                                    environmentName={changeRequest.environment}
                                    projectId={changeRequest.project}
                                    changeRequestState={changeRequest.state}
                                />
                            )}
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
                                change.action === 'startMilestone' ||
                                change.action === 'changeSafeguard' ||
                                change.action === 'deleteSafeguard' ||
                                change.action ===
                                    'resumeMilestoneProgression') && (
                                <ReleasePlanChange
                                    actions={actions}
                                    change={change}
                                    featureName={feature.name}
                                    environmentName={changeRequest.environment}
                                    projectId={changeRequest.project}
                                    changeRequestState={changeRequest.state}
                                    onRefetch={onRefetch}
                                />
                            )}
                        </>
                    )
                )}
            </ChangeInnerBox>
        </StyledSingleChangeBox>
    );
};
