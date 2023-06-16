import { Alert, styled } from '@mui/material';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { IProjectCard } from 'interfaces/project';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatStrategyName } from 'utils/strategyNames';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledUl = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    paddingLeft: 0,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

interface ISegmentProjectAlertProps {
    projects: IProjectCard[];
    strategies: IFeatureStrategy[];
    projectsUsed: string[];
    availableProjects: IProjectCard[];
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
            {Array.from(projectsUsed).map(projectId => (
                <li key={projectId} onClick={trackClick}>
                    <Link
                        to={`/projects/${projectId}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {projects.find(({ id }) => id === projectId)?.name ??
                            projectId}
                    </Link>
                    <ul>
                        {strategies
                            ?.filter(
                                strategy => strategy.projectId === projectId
                            )
                            .map(strategy => (
                                <li key={strategy.id}>
                                    <Link
                                        to={formatEditStrategyPath(
                                            strategy.projectId!,
                                            strategy.featureName!,
                                            strategy.environment!,
                                            strategy.id
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {strategy.featureName!}{' '}
                                        {formatStrategyNameParens(strategy)}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </li>
            ))}
        </StyledUl>
    );

    if (projectsUsed.length > 1) {
        return (
            <StyledAlert severity="info">
                You can't specify a project for this segment because it is used
                in multiple projects:
                {projectList}
            </StyledAlert>
        );
    }

    if (availableProjects.length === 1) {
        return (
            <StyledAlert severity="info">
                You can't specify a project other than{' '}
                <strong>{availableProjects[0].name}</strong> for this segment
                because it is used here:
                {projectList}
            </StyledAlert>
        );
    }

    return null;
};

const formatStrategyNameParens = (strategy: IFeatureStrategy): string => {
    if (!strategy.strategyName) {
        return '';
    }

    return `(${formatStrategyName(strategy.strategyName)})`;
};
