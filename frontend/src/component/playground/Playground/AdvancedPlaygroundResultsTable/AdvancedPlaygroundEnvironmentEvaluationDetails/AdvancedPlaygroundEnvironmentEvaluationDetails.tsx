import { AdvancedPlaygroundEnvironmentFeatureSchema } from 'openapi';

interface IAdvancedPlaygroundEnvironmentEvaluationDetailsProps {
    environment: AdvancedPlaygroundEnvironmentFeatureSchema[];
}

export const AdvancedPlaygroundEnvironmentEvaluationDetails = ({
    environment,
}: IAdvancedPlaygroundEnvironmentEvaluationDetailsProps) => {
    return <pre>{JSON.stringify(environment, null, 4)}</pre>;
};
