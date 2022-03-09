import { IFeatureStrategy } from '../../../../../../../interfaces/strategy';
import FeatureOverviewEnvironmentStrategy from './FeatureOverviewEnvironmentStrategy/FeatureOverviewEnvironmentStrategy';

interface FeatureOverviewEnvironmentStrategiesProps {
    strategies: IFeatureStrategy[];
    environmentName: string;
}

const FeatureOverviewEnvironmentStrategies = ({
    strategies,
    environmentName,
}: FeatureOverviewEnvironmentStrategiesProps) => {
    const renderStrategies = () => {
        return strategies.map(strategy => {
            return (
                <FeatureOverviewEnvironmentStrategy
                    key={strategy.id}
                    strategy={strategy}
                    environmentId={environmentName}
                />
            );
        });
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
            }}
        >
            {renderStrategies()}
        </div>
    );
};

export default FeatureOverviewEnvironmentStrategies;
