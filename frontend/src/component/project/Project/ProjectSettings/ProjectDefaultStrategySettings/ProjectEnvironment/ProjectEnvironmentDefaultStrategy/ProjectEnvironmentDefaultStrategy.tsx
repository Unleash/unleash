import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Link } from 'react-router-dom';
import Edit from '@mui/icons-material/Edit';
import type { ProjectEnvironmentType } from 'interfaces/environments';
import { useMemo } from 'react';
import type { CreateFeatureStrategySchema } from 'openapi';
import {
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import { StrategyItem } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem';
import type { IFeatureStrategy } from 'interfaces/strategy';

interface ProjectEnvironmentDefaultStrategyProps {
    environment: ProjectEnvironmentType;
}

export const formatEditProjectEnvironmentStrategyPath = (
    projectId: string,
    environmentId: string,
): string => {
    const params = new URLSearchParams({ environmentId });

    return `/projects/${projectId}/settings/default-strategy/edit?${params}`;
};

const DEFAULT_STRATEGY: CreateFeatureStrategySchema = {
    name: 'flexibleRollout',
    disabled: false,
    constraints: [],
    title: '',
    parameters: {
        rollout: '100',
        stickiness: 'default',
        groupId: '',
    },
};

export const ProjectEnvironmentDefaultStrategy = ({
    environment,
}: ProjectEnvironmentDefaultStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { environment: environmentId, defaultStrategy } = environment;

    const editStrategyPath = formatEditProjectEnvironmentStrategyPath(
        projectId,
        environmentId,
    );

    const strategy: Omit<IFeatureStrategy, 'id'> = useMemo(() => {
        const baseDefaultStrategy = defaultStrategy
            ? defaultStrategy
            : DEFAULT_STRATEGY;
        return {
            ...baseDefaultStrategy,
            disabled: false,
            constraints: baseDefaultStrategy.constraints ?? [],
            title: baseDefaultStrategy.title ?? '',
            parameters: baseDefaultStrategy.parameters ?? {},
        };
    }, [JSON.stringify(defaultStrategy)]);

    return (
        <StrategyItem
            strategy={strategy}
            headerItemsRight={
                <>
                    <PermissionIconButton
                        permission={[
                            PROJECT_DEFAULT_STRATEGY_WRITE,
                            UPDATE_PROJECT,
                        ]}
                        environmentId={environmentId}
                        projectId={projectId}
                        component={Link}
                        to={editStrategyPath}
                        tooltipProps={{
                            title: `Edit default strategy for "${environmentId}"`,
                        }}
                        data-testid={`STRATEGY_EDIT-${strategy.name}`}
                    >
                        <Edit />
                    </PermissionIconButton>
                </>
            }
        />
    );
};
