import { Alert, styled } from '@mui/material';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { IProjectCard } from 'interfaces/project';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatStrategyName } from 'utils/strategyNames';

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
    const projectList = (
        <ul>
            {Array.from(projectsUsed).map(projectId => (
                <li key={projectId}>
                    <Link to={`/projects/${projectId}`} target="_blank">
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
                                    >
                                        {strategy.featureName!}{' '}
                                        {formatStrategyNameParens(strategy)}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </li>
            ))}
        </ul>
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
                because it is used in that project:
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
