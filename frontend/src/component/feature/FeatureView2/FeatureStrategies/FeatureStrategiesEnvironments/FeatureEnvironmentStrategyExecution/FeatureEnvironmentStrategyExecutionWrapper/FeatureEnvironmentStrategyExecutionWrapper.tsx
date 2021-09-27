import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import FeatureStrategiesUIContext from '../../../../../../../contexts/FeatureStrategiesUIContext';
import useFeatureStrategy from '../../../../../../../hooks/api/getters/useFeatureStrategy/useFeatureStrategy';
import { IFeatureViewParams } from '../../../../../../../interfaces/params';
import FeatureStrategyExecution from '../../../FeatureStrategyExecution/FeatureStrategyExecution';

interface IFeatureEnvironmentStrategyExecutionWrapperProps {
    strategyId: string;
}

const FeatureEnvironmentStrategyExecutionWrapper = ({
    strategyId,
}: IFeatureEnvironmentStrategyExecutionWrapperProps) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { activeEnvironment } = useContext(FeatureStrategiesUIContext);

    const { strategy } = useFeatureStrategy(
        projectId,
        featureId,
        activeEnvironment.name,
        strategyId,
        {
            revalidateOnMount: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            revalidateOnFocus: false,
        }
    );
    return (
        <div
            style={{
                padding: '1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <FeatureStrategyExecution
                constraints={strategy.constraints}
                parameters={strategy.parameters}
            />
        </div>
    );
};

export default FeatureEnvironmentStrategyExecutionWrapper;
