import { useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItem } from './StrategyItem/StrategyItem';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import {
    useStrategyChangesFromRequest,
    type UseStrategyChangeFromRequestResult,
} from './StrategyItem/useStrategyChangesFromRequest';
import { ChangesScheduledBadge } from 'component/changeRequest/ModifiedInChangeRequestStatusBadge/ChangesScheduledBadge';
import type { IFeatureChange } from 'component/changeRequest/changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import {
    type ScheduledChangeRequestViewModel,
    useScheduledChangeRequestsWithStrategy,
} from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';

interface IStrategyItemProps {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
    otherEnvironments?: IFeatureEnvironment['name'][];
}

export const StrategyNonDraggableItem = ({
    strategy,
    index,
    environmentName,
    otherEnvironments,
}: IStrategyItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const ref = useRef<HTMLDivElement>(null);
    const strategyChangesFromRequest = useStrategyChangesFromRequest(
        projectId,
        featureId,
        environmentName,
        strategy.id,
    );

    const { changeRequests: scheduledChangesUsingStrategy } =
        useScheduledChangeRequestsWithStrategy(projectId, strategy.id);

    return (
        <Box key={strategy.id} ref={ref} sx={{ opacity: '1' }}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text='OR' />}
            />

            <StrategyItem
                strategy={strategy}
                environmentId={environmentName}
                otherEnvironments={otherEnvironments}
                orderNumber={index + 1}
                headerChildren={renderHeaderChildren(
                    strategyChangesFromRequest,
                    scheduledChangesUsingStrategy,
                )}
            />
        </Box>
    );
};

const ChangeRequestStatusBadge = ({
    change,
}: {
    change: IFeatureChange | undefined;
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
                show={<Badge color='warning'>Modified in draft</Badge>}
            />
            <ConditionallyRender
                condition={change?.action === 'deleteStrategy'}
                show={<Badge color='error'>Deleted in draft</Badge>}
            />
        </Box>
    );
};

const renderHeaderChildren = (
    changes?: UseStrategyChangeFromRequestResult,
    scheduledChanges?: ScheduledChangeRequestViewModel[],
): JSX.Element[] => {
    const badges: JSX.Element[] = [];
    if (changes?.length === 0 && scheduledChanges?.length === 0) {
        return [];
    }

    const draftChange = changes?.find(
        ({ isScheduledChange }) => !isScheduledChange,
    );

    if (draftChange) {
        badges.push(
            <ChangeRequestStatusBadge
                key={`draft-change#${draftChange.change.id}`}
                change={draftChange.change}
            />,
        );
    }

    if (scheduledChanges && scheduledChanges.length > 0) {
        badges.push(
            <ChangesScheduledBadge
                key='scheduled-changes'
                scheduledChangeRequestIds={scheduledChanges.map(
                    (scheduledChange) => scheduledChange.id,
                )}
            />,
        );
    }

    return badges;
};
