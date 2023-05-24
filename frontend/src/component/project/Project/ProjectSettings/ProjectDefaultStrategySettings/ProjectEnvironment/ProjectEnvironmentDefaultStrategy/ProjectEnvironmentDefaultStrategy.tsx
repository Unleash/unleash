import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Link } from 'react-router-dom';
import { Edit } from '@mui/icons-material';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import { ProjectEnvironmentType } from 'interfaces/environments';
import React, { useMemo } from 'react';
import { CreateFeatureStrategySchema } from 'openapi';

interface ProjectEnvironmentDefaultStrategyProps {
    environment: ProjectEnvironmentType;
    description: string;
}

export const formatEditProjectEnvironmentStrategyPath = (
    projectId: string,
    environmentId: string
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

const ProjectEnvironmentDefaultStrategy = ({
    environment,
    description,
}: ProjectEnvironmentDefaultStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { environment: environmentId, defaultStrategy } = environment;

    const editStrategyPath = formatEditProjectEnvironmentStrategyPath(
        projectId,
        environmentId
    );

    const strategy: CreateFeatureStrategySchema = useMemo(() => {
        return defaultStrategy ? defaultStrategy : DEFAULT_STRATEGY;
    }, [JSON.stringify(defaultStrategy)]);

    return (
        <>
            <StrategyItemContainer
                strategy={strategy as any}
                description={description}
                actions={
                    <>
                        <PermissionIconButton
                            permission={UPDATE_FEATURE_STRATEGY}
                            environmentId={environmentId}
                            projectId={projectId}
                            component={Link}
                            to={editStrategyPath}
                            tooltipProps={{
                                title: `Edit default strategy for "${environmentId}"`,
                            }}
                            data-testid={`STRATEGY_EDIT-${strategy?.name}`}
                        >
                            <Edit />
                        </PermissionIconButton>
                    </>
                }
            >
                <StrategyExecution strategy={strategy} />
            </StrategyItemContainer>
        </>
    );
};

export default ProjectEnvironmentDefaultStrategy;
