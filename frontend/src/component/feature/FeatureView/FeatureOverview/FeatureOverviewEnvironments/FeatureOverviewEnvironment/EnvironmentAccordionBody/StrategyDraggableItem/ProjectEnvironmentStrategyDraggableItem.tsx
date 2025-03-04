import { type DragEventHandler, type RefObject, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategyChangesFromRequest } from './StrategyItem/useStrategyChangesFromRequest';
import { ChangesScheduledBadge } from 'component/changeRequest/ModifiedInChangeRequestStatusBadge/ChangesScheduledBadge';
import { useScheduledChangeRequestsWithStrategy } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { ChangeRequestDraftStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestDraftStatusBadge';
import { CopyStrategyIconMenu } from './StrategyItem/CopyStrategyIconMenu/CopyStrategyIconMenu';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Edit from '@mui/icons-material/Edit';
import MenuStrategyRemove from './StrategyItem/MenuStrategyRemove/MenuStrategyRemove';
import { Link } from 'react-router-dom';
import { UPDATE_FEATURE_STRATEGY } from '@server/types/permissions';
import { StrategyDraggableItem } from './StrategyDraggableItem';

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

const onDragNoOp = () => () => {};

export const ProjectEnvironmentStrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    otherEnvironments,
    isDragging,
    onDragStartRef = onDragNoOp,
    onDragOver = onDragNoOp,
    onDragEnd = onDragNoOp,
}: ProjectEnvironmentStrategyDraggableItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const ref = useRef<HTMLDivElement>(null);
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
        <Box
            key={strategy.id}
            ref={ref}
            onDragOver={onDragOver(ref, index)}
            sx={{ opacity: isDragging ? '0.5' : '1' }}
        >
            <StrategyDraggableItem
                strategy={strategy}
                onDragEnd={onDragEnd}
                onDragStartRef={onDragStartRef}
                onDragOver={onDragOver}
                index={index}
                headerItemsRight={
                    <>
                        {draftChange && !isSmallScreen ? (
                            <ChangeRequestDraftStatusBadge
                                sx={{ mr: 1.5 }}
                                changeAction={'updateStrategy'}
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
                        {otherEnvironments && otherEnvironments?.length > 0 ? (
                            <CopyStrategyIconMenu
                                environmentId={environmentName}
                                environments={otherEnvironments as string[]}
                                strategy={strategy}
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
                        <MenuStrategyRemove
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environmentName}
                            strategy={strategy}
                        />
                    </>
                }
            />
        </Box>
    );
};
