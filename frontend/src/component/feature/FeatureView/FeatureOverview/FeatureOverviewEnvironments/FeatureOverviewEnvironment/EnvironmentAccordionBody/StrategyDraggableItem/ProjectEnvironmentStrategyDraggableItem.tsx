import { type DragEventHandler, type RefObject, useRef } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategyChangesFromRequest } from './StrategyItem/useStrategyChangesFromRequest.tsx';
import { ChangesScheduledBadge } from 'component/changeRequest/ModifiedInChangeRequestStatusBadge/ChangesScheduledBadge';
import { useScheduledChangeRequestsWithStrategy } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { ChangeRequestDraftStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestDraftStatusBadge';
import { CopyStrategyIconMenu } from './StrategyItem/CopyStrategyIconMenu/CopyStrategyIconMenu.tsx';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Edit from '@mui/icons-material/Edit';
import MenuStrategyRemove from './StrategyItem/MenuStrategyRemove/MenuStrategyRemove.tsx';
import { Link } from 'react-router-dom';
import { UPDATE_FEATURE_STRATEGY } from '@server/types/permissions';
import { StrategyDraggableItem } from './StrategyDraggableItem.tsx';

type ProjectEnvironmentStrategyDraggableItemProps = {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
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
};

export const ProjectEnvironmentStrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    otherEnvironments,
    isDragging,
    onDragStartRef,
    onDragOver,
    onDragEnd,
}: ProjectEnvironmentStrategyDraggableItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const _ref = useRef<HTMLDivElement>(null);
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
                    <MenuStrategyRemove
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentName}
                        strategy={strategy}
                    />
                </>
            }
        />
    );
};
