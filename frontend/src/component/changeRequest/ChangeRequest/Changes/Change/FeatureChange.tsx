import type { FC, ReactNode } from 'react';
import type {
    IFeatureChange,
    ChangeRequestType,
    IChangeRequestFeature,
} from '../../../changeRequest.types';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, styled } from '@mui/material';
import { ToggleStatusChange } from './ToggleStatusChange.tsx';
import { VariantPatch } from './VariantPatch/VariantPatch.tsx';
import { EnvironmentStrategyExecutionOrder } from './EnvironmentStrategyExecutionOrder/EnvironmentStrategyExecutionOrder.tsx';
import { ArchiveFeatureChange } from './ArchiveFeatureChange.tsx';
import { DependencyChange } from './DependencyChange.tsx';
import { Link } from 'react-router-dom';
import { ReleasePlanChange } from './ReleasePlanChange.tsx';
import { FeatureEnvSafeguardChange } from './FeatureEnvSafeguardChange.tsx';
import { StrategyChange } from './StrategyChange.tsx';

const StyledSingleChangeBox = styled(Box)(({ theme }) => ({
    overflow: 'hidden',
    border: '1px solid',
    borderBottom: 'none',
    borderRadius: 0,
    borderColor: theme.palette.divider,
    '&[data-conflict="change"]': {
        borderColor: theme.palette.warning.border,
    },
    '[data-conflict="change"] + &': {
        borderTopColor: theme.palette.warning.border,
    },
    '[data-conflict="feature"] &': {
        borderTopColor: theme.palette.divider,
    },
    '&:last-child': {
        borderBottomStyle: 'solid',
        borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    },
}));

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
    '&:empty': {
        display: 'none',
    },
}));

export const FeatureChange: FC<{
    actions?: ReactNode;
    changeRequest: ChangeRequestType;
    change: IFeatureChange;
    feature: IChangeRequestFeature;
    onNavigate?: () => void;
    isDefaultChange?: boolean;
    onRefetch?: () => void;
}> = ({
    change,
    feature,
    changeRequest,
    actions,
    onNavigate,
    isDefaultChange,
    onRefetch,
}) => {
    const conflict = change.conflict || change.scheduleConflicts;
    return (
        <StyledSingleChangeBox
            data-conflict={conflict ? 'change' : undefined}
            key={objectId(change)}
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

                {change.action === 'addStrategy' ||
                change.action === 'deleteStrategy' ||
                change.action === 'updateStrategy' ? (
                    <StrategyChange
                        actions={actions}
                        isDefaultChange={isDefaultChange}
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
                    change.action === 'startMilestone' ||
                    change.action === 'changeMilestoneProgression' ||
                    change.action === 'deleteMilestoneProgression' ||
                    change.action === 'changeReleasePlanSafeguard' ||
                    change.action === 'deleteReleasePlanSafeguard' ||
                    change.action === 'resumeMilestoneProgression' ||
                    change.action === 'updateMilestoneStrategy') && (
                    <ReleasePlanChange
                        actions={actions}
                        change={change}
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                        changeRequestState={changeRequest.state}
                        changeRequest={changeRequest}
                        feature={feature}
                        onRefetch={onRefetch}
                    />
                )}
                {(change.action === 'changeFeatureEnvSafeguard' ||
                    change.action === 'deleteFeatureEnvSafeguard') && (
                    <FeatureEnvSafeguardChange
                        actions={actions}
                        change={change}
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                        changeRequestState={changeRequest.state}
                        onRefetch={onRefetch}
                    />
                )}
            </ChangeInnerBox>
        </StyledSingleChangeBox>
    );
};
