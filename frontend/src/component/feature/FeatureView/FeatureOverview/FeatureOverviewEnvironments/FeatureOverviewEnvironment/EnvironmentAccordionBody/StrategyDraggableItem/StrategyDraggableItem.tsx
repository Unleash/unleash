import { DragEventHandler, RefObject, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItem } from './StrategyItem/StrategyItem';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Badge } from 'component/common/Badge/Badge';
import { IChange } from 'component/changeRequest/changeRequest.types';
import { useStrategyChangeFromRequest } from './StrategyItem/useStrategyChangeFromRequest';

interface IStrategyDraggableItemProps {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
    otherEnvironments?: IFeatureEnvironment['name'][];
    isDragging?: boolean;
    onDragStartRef: (
        ref: RefObject<HTMLDivElement>,
        index: number
    ) => DragEventHandler<HTMLButtonElement>;
    onDragOver: (
        ref: RefObject<HTMLDivElement>,
        index: number
    ) => DragEventHandler<HTMLDivElement>;
    onDragEnd: () => void;
}
export const StrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    otherEnvironments,
    isDragging,
    onDragStartRef,
    onDragOver,
    onDragEnd,
}: IStrategyDraggableItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const ref = useRef<HTMLDivElement>(null);
    const change = useStrategyChangeFromRequest(
        projectId,
        featureId,
        environmentName,
        strategy.id
    );

    return (
        <Box
            key={strategy.id}
            ref={ref}
            onDragOver={onDragOver(ref, index)}
            sx={{ opacity: isDragging ? '0.5' : '1' }}
        >
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />

            <StrategyItem
                strategy={strategy}
                environmentId={environmentName}
                otherEnvironments={otherEnvironments}
                onDragStart={onDragStartRef(ref, index)}
                onDragEnd={onDragEnd}
                orderNumber={index + 1}
                headerChildren={<ChangeRequestStatusBadge change={change} />}
            />
        </Box>
    );
};

const ChangeRequestStatusBadge = ({
    change,
}: {
    change: IChange | undefined;
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    if (isSmallScreen) {
        return null;
    }

    return (
        <Box sx={{ mr: 1.5 }}>
            <ConditionallyRender
                condition={change?.action === 'updateStrategy'}
                show={<Badge color="warning">Modified in draft</Badge>}
            />
            <ConditionallyRender
                condition={change?.action === 'deleteStrategy'}
                show={<Badge color="error">Deleted in draft</Badge>}
            />
        </Box>
    );
};
