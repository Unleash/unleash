import { IFeatureStrategy } from 'interfaces/strategy';
import FeatureOverviewEnvironmentStrategy from './FeatureOverviewEnvironmentStrategy/FeatureOverviewEnvironmentStrategy';

interface IFeatureOverviewEnvironmentStrategiesProps {
    strategies: IFeatureStrategy[];
    environmentName: string;
}

const FeatureOverviewEnvironmentStrategies = ({
    strategies,
    environmentName,
}: IFeatureOverviewEnvironmentStrategiesProps) => {
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
