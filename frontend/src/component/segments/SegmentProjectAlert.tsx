import { Alert, styled } from '@mui/material';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import type { ProjectSchema } from 'openapi';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatStrategyName } from 'utils/strategyNames';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type {
    ChangeRequestNewStrategy,
    ChangeRequestStrategy,
    ChangeRequestUpdatedStrategy,
} from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';

const StyledUl = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    paddingLeft: 0,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

interface ISegmentProjectAlertProps {
    projects: ProjectSchema[];
    strategies: (
        | IFeatureStrategy
        | ChangeRequestUpdatedStrategy
        | ChangeRequestNewStrategy
    )[];
    projectsUsed: string[];
    availableProjects: ProjectSchema[];
}

export const SegmentProjectAlert = ({
    projects,
    strategies,
    projectsUsed,
    availableProjects,
}: ISegmentProjectAlertProps) => {
    const { trackEvent } = usePlausibleTracker();

    const trackClick = () => {
        trackEvent('segment-usage', {
            props: {
                eventType: 'segment usage viewed',
            },
        });
    };
    const projectList = (
        <StyledUl>
            {Array.from(projectsUsed).map((projectId) => (
                <li key={projectId} onClick={trackClick}>
                    <Link
                        to={`/projects/${projectId}`}
                        target='_blank'
                        rel='noreferrer'
                    >
                        {projects.find(({ id }) => id === projectId)?.name ??
                            projectId}
                    </Link>
                    <ul>
                        {strategies
                            ?.filter(
                                (strategy) => strategy.projectId === projectId,
                            )
                            .map((strategy, index) =>
                                strategyListItem(strategy, index),
                            )}
                    </ul>
                </li>
            ))}
        </StyledUl>
    );

    if (projectsUsed.length > 0) {
        return (
            <StyledAlert severity='info'>
                <ConditionallyRender
                    condition={projectsUsed.length > 1}
                    show={
                        <span>
                            You can't specify a project for this segment because
                            it is used in multiple projects:
                        </span>
                    }
                    elseShow={<span>Usage of this segment:</span>}
                />
                {projectList}
            </StyledAlert>
        );
    }

    return null;
};

const formatStrategyNameParens = (strategy: {
    strategyName?: string;
}): string => {
    if (!strategy.strategyName) {
        return '';
    }

    return `(${formatStrategyName(strategy.strategyName)})`;
};

export const formatChangeRequestPath = (
    projectId: string,
    changeRequestId: number,
): string => {
    return `/projects/${projectId}/change-requests/${changeRequestId}`;
};

const strategyListItem = (
    strategy:
        | IFeatureStrategy
        | ChangeRequestUpdatedStrategy
        | ChangeRequestNewStrategy,
    index: number,
) => {
    const isChangeRequest = (
        strategy: IFeatureStrategy | ChangeRequestStrategy,
    ): strategy is ChangeRequestStrategy => 'changeRequest' in strategy;

    if (isChangeRequest(strategy)) {
        const { id, title } = strategy.changeRequest;

        const text = title ? `#${id} (${title})` : `#${id}`;
        return (
            <li key={`#${strategy.changeRequest.id}@${index}`}>
                <p>
                    {strategy.featureName}{' '}
                    {`${formatStrategyNameParens(
                        strategy,
                    )} — in change request `}
                    <Link
                        to={formatChangeRequestPath(strategy.projectId, id)}
                        target='_blank'
                        rel='noopener noreferrer'
                        title={`Change request ${id}`}
                    >
                        {text}
                    </Link>
                </p>
            </li>
        );
    } else {
        return (
            <li key={strategy.id}>
                <Link
                    to={formatEditStrategyPath(
                        strategy.projectId!,
                        strategy.featureName!,
                        strategy.environment!,
                        strategy.id,
                    )}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {strategy.featureName!} {formatStrategyNameParens(strategy)}
                </Link>
            </li>
        );
    }
};
