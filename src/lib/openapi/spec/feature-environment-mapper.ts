import { IFeatureEnvironmentInfo } from '../../types/model';
import { FeatureEnvironmentSchema } from './feature-environment-schema';
import { FeatureStrategyMapper } from './feature-strategy-mapper';
import { SchemaMapper } from '../types';

export class FeatureEnvironmentMapper
    implements
        SchemaMapper<
            FeatureEnvironmentSchema,
            IFeatureEnvironmentInfo,
            Partial<FeatureEnvironmentSchema>
        >
{
    private mapper = new FeatureStrategyMapper();

    fromPublic(input: FeatureEnvironmentSchema): IFeatureEnvironmentInfo {
        return {
            ...input,
            strategies: input.strategies.map(this.mapper.fromPublic),
        };
    }

    toPublic(input: IFeatureEnvironmentInfo): FeatureEnvironmentSchema {
        return {
            ...input,
            strategies: input.strategies.map(this.mapper.toPublic),
        };
    }
}
