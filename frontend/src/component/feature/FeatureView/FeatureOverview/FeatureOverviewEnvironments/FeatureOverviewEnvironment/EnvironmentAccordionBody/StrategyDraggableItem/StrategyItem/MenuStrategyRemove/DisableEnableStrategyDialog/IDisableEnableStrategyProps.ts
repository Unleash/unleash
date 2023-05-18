import { IFeatureStrategy } from 'interfaces/strategy';

export interface IDisableEnableStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IFeatureStrategy;
    text?: boolean;
}
