import type { DragEventHandler, RefObject } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategyChangesFromRequest } from './StrategyItem/useStrategyChangesFromRequest.tsx';
import { ChangesScheduledBadge } from 'component/changeRequest/ModifiedInChangeRequestStatusBadge/ChangesScheduledBadge';
import { useScheduledChangeRequestsWithStrategy } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import {
    formatEditStrategyPath,
    type FeatureEnvironmentStrategyScope,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { ChangeRequestDraftStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestDraftStatusBadge';
import { CopyStrategyIconMenu } from './StrategyItem/CopyStrategyIconMenu/CopyStrategyIconMenu.tsx';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Edit from '@mui/icons-material/Edit';
import MenuStrategyRemove from './StrategyItem/MenuStrategyRemove/MenuStrategyRemove.tsx';
import { Link } from 'react-router-dom';
import { UPDATE_FEATURE_STRATEGY } from '@server/types/permissions';
import { StrategyDraggableItem } from './StrategyDraggableItem.tsx';

type EditControlsProps = {
    projectId: string;
    featureId: string;
    environmentName: string;
    strategy: IFeatureStrategy;
    editStrategyPath: string;
    otherEnvironments?: IFeatureEnvironment['name'][];
    scope: FeatureEnvironmentStrategyScope;
};

const EditControls = ({
    projectId,
    featureId,
    environmentName,
    strategy,
    editStrategyPath,
    otherEnvironments,
    scope,
}: EditControlsProps) => (
    <>
        <PermissionIconButton
            permission={UPDATE_FEATURE_STRATEGY}
            environmentId={environmentName}
            projectId={projectId}
            component={Link}
            to={editStrategyPath}
            tooltipProps={{
                title: 'Edit strategy',
            }}
            data-testid={`STRATEGY_EDIT-${strategy.name}`}
        >
            <Edit />
        </PermissionIconButton>
        {otherEnvironments && otherEnvironments?.length > 0 ? (
            <CopyStrategyIconMenu
                environmentId={environmentName}
                environments={otherEnvironments as string[]}
                strategy={strategy}
            />
        ) : null}
        {scope === 'milestone' ? null : (
            <MenuStrategyRemove
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentName}
                strategy={strategy}
            />
        )}
    </>
);

type ProjectEnvironmentStrategyDraggableItemProps = {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
    scope?: FeatureEnvironmentStrategyScope;
    otherEnvironments?: IFeatureEnvironment['name'][];
    isDragging?: boolean;
    onDragStartRef?: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLButtonElement>;
    onDragOver?: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLDivElement>;
    onDragEnd?: () => void;
    featureId: string;
    readonly?: boolean;
    onEditStrategy?: (strategyId: string) => void;
};

export const ProjectEnvironmentStrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    scope = 'default',
    otherEnvironments,
    isDragging,
    onDragStartRef,
    onDragOver,
    onDragEnd,
    featureId,
    readonly,
    onEditStrategy,
}: ProjectEnvironmentStrategyDraggableItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const strategyChangesFromRequest = useStrategyChangesFromRequest(
        projectId,
        featureId,
        environmentName,
        strategy.id,
    );

    const { changeRequests: scheduledChanges } =
        useScheduledChangeRequestsWithStrategy(projectId, strategy.id);

    const editStrategyPath = formatEditStrategyPath(
        projectId,
        featureId,
        environmentName,
        strategy.id,
    );

    const draftChange = strategyChangesFromRequest?.find(
        ({ isScheduledChange }) => !isScheduledChange,
    );

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const EditControls: React.FC = () => (
        <>
            {onEditStrategy ? (
                <PermissionIconButton
                    permission={UPDATE_FEATURE_STRATEGY}
                    environmentId={environmentName}
                    projectId={projectId}
                    onClick={() => onEditStrategy(strategy.id)}
                    tooltipProps={{
                        title: 'Edit strategy',
                    }}
                    data-testid={`STRATEGY_EDIT-${strategy.name}`}
                >
                    <Edit />
                </PermissionIconButton>
            ) : (
                <PermissionIconButton
                    permission={UPDATE_FEATURE_STRATEGY}
                    environmentId={environmentName}
                    projectId={projectId}
                    component={Link}
                    to={editStrategyPath}
                    tooltipProps={{
                        title: 'Edit strategy',
                    }}
                    data-testid={`STRATEGY_EDIT-${strategy.name}`}
                >
                    <Edit />
                </PermissionIconButton>
            )}
            {otherEnvironments && otherEnvironments?.length > 0 ? (
                <CopyStrategyIconMenu
                    environmentId={environmentName}
                    environments={otherEnvironments as string[]}
                    strategy={strategy}
                />
            ) : null}
            {scope === 'milestone' ? null : (
                <MenuStrategyRemove
                    projectId={projectId}
                    featureId={featureId}
                    environmentId={environmentName}
                    strategy={strategy}
                />
            )}
        </>
    );

    return (
        <StrategyDraggableItem
            strategy={strategy}
            onDragEnd={onDragEnd}
            onDragStartRef={onDragStartRef}
            onDragOver={onDragOver}
            index={index}
            isDragging={isDragging}
            headerItemsRight={
                <>
                    {draftChange && !isSmallScreen ? (
                        <ChangeRequestDraftStatusBadge
                            sx={{ mr: 1.5 }}
                            changeAction={draftChange.change.action}
                        />
                    ) : null}

                    {scheduledChanges &&
                    scheduledChanges.length > 0 &&
                    !isSmallScreen ? (
                        <ChangesScheduledBadge
                            scheduledChangeRequestIds={(
                                scheduledChanges ?? []
                            ).map((scheduledChange) => scheduledChange.id)}
                        />
                    ) : null}
                    {readonly ? null : (
                        <EditControls
                            projectId={projectId}
                            featureId={featureId}
                            environmentName={environmentName}
                            strategy={strategy}
                            editStrategyPath={editStrategyPath}
                            otherEnvironments={otherEnvironments}
                            scope={scope}
                        />
                    )}
                </>
            }
        />
    );
};
