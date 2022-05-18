import { SchemaMapper } from './mapper';
import { IFeatureEnvironmentInfo } from '../../types/model';
import { FeatureEnvironmentInfoSchema } from '../spec/feature-environment-info-schema';
import { FeatureStrategyMapper } from './feature-strategy.mapper';

export class EnvironmentInfoMapper
    implements
        SchemaMapper<
            FeatureEnvironmentInfoSchema,
            IFeatureEnvironmentInfo,
            Partial<FeatureEnvironmentInfoSchema>
        >
{
    private mapper = new FeatureStrategyMapper();

    fromPublic(input: FeatureEnvironmentInfoSchema): IFeatureEnvironmentInfo {
        return {
            ...input,
            strategies: input.strategies.map(this.mapper.fromPublic),
        };
    }

    toPublic(input: IFeatureEnvironmentInfo): FeatureEnvironmentInfoSchema {
        return {
            ...input,
            strategies: input.strategies.map(this.mapper.toPublic),
        };
    }
}
