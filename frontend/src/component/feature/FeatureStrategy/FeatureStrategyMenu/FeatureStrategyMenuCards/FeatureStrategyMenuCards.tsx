import { useMemo } from 'react';
import { List, ListItem } from '@mui/material';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard';

interface IFeatureStrategyMenuCardsProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const FeatureStrategyMenuCards = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyMenuCardsProps) => {
    const { strategies } = useStrategies();

    const availableStrategies = useMemo(() => {
        return strategies.filter(strategy => !strategy.deprecated);
    }, [strategies]);

    return (
        <List dense>
            {availableStrategies.map(strategy => (
                <ListItem key={strategy.name}>
                    <FeatureStrategyMenuCard
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategy={strategy}
                    />
                </ListItem>
            ))}
        </List>
    );
};
