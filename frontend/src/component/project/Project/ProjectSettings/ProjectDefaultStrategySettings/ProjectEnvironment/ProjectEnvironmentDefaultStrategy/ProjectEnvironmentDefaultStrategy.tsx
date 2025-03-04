import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Link } from 'react-router-dom';
import Edit from '@mui/icons-material/Edit';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import type { ProjectEnvironmentType } from 'interfaces/environments';
import { useMemo } from 'react';
import type { CreateFeatureStrategySchema } from 'openapi';
import {
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/LegacyStrategyItemContainer';

interface ProjectEnvironmentDefaultStrategyProps {
    environment: ProjectEnvironmentType;
    description: string;
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

const ProjectEnvironmentDefaultStrategy = ({
    environment,
    description,
}: ProjectEnvironmentDefaultStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { environment: environmentId, defaultStrategy } = environment;

    const editStrategyPath = formatEditProjectEnvironmentStrategyPath(
        projectId,
        environmentId,
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
                            data-testid={`STRATEGY_EDIT-${strategy?.name}`}
                        >
                            <Edit />
                        </PermissionIconButton>
                    </>
                }
            >
                <StrategyExecution strategy={strategy} />

                {strategy.variants && strategy.variants.length > 0 ? (
                    <SplitPreviewSlider variants={strategy.variants} />
                ) : null}
            </StrategyItemContainer>
        </>
    );
};

export default ProjectEnvironmentDefaultStrategy;
