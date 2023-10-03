import { Alert, styled } from '@mui/material';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatStrategyName } from 'utils/strategyNames';
import { useStrategiesByContext } from 'hooks/api/getters/useStrategiesByContext/useStrategiesByContext';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledUl = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    paddingLeft: 0,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

interface IContextFieldUsageProps {
    contextName: string;
}

export const ContextFieldUsage = ({ contextName }: IContextFieldUsageProps) => {
    const { strategies } = useStrategiesByContext(contextName);
    const { projects } = useProjects();
    const { trackEvent } = usePlausibleTracker();

    const trackClick = () => {
        trackEvent('context-usage', {
            props: {
                eventType: 'context usage viewed',
            },
        });
    };

    const projectsUsed = Array.from(
        new Set<string>(
            strategies.map(({ projectId }) => projectId!).filter(Boolean)
        )
    );

    const projectList = (
        <StyledUl>
            {projectsUsed.map(projectId => (
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
    if (projectsUsed.length > 0) {
        return (
            <StyledAlert severity="info">
                Usage of this context field:
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
