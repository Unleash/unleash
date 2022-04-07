import { IFeatureStrategy } from 'interfaces/strategy';
import FeatureOverviewEnvironmentStrategy from './FeatureOverviewEnvironmentStrategy/FeatureOverviewEnvironmentStrategy';

interface FeatureOverviewEnvironmentStrategiesProps {
    strategies: IFeatureStrategy[];
    environmentName: string;
}

const FeatureOverviewEnvironmentStrategies = ({
    strategies,
    environmentName,
}: FeatureOverviewEnvironmentStrategiesProps) => {
    return (
        <>
            {strategies.map(strategy => (
                <FeatureOverviewEnvironmentStrategy
                    key={strategy.id}
                    strategy={strategy}
                    environmentId={environmentName}
                />
            ))}
        </>
    );
};

export default FeatureOverviewEnvironmentStrategies;
