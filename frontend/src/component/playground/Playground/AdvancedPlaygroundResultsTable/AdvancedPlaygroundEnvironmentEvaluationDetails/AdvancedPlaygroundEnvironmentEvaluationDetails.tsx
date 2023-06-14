import { AdvancedPlaygroundEnvironment } from '../advancedPlayground';

interface IAdvancedPlaygroundEnvironmentEvaluationDetailsProps {
    environment: AdvancedPlaygroundEnvironment;
}

export const AdvancedPlaygroundEnvironmentEvaluationDetails = ({
    environment,
}: IAdvancedPlaygroundEnvironmentEvaluationDetailsProps) => {
    return <pre>{JSON.stringify(environment, null, 4)}</pre>;
};
