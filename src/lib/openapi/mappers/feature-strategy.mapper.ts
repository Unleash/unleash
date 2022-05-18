import { SchemaMapper } from './mapper';
import { IFeatureStrategy } from '../../types/model';
import { CreateStrategySchema } from '../spec/create-strategy-schema';
import { UpdateStrategySchema } from '../spec/update-strategy-schema';
import { FeatureStrategySchema } from '../spec/feature-strategy-schema';

export class FeatureStrategyMapper
    implements
        SchemaMapper<
            FeatureStrategySchema,
            IFeatureStrategy,
            CreateStrategySchema | UpdateStrategySchema
        >
{
    fromPublic(input: FeatureStrategySchema): IFeatureStrategy {
        return {
            ...input,
            id: input.id || '',
            projectId: input.projectId! || '',
        };
    }

    toPublic(input: IFeatureStrategy): FeatureStrategySchema {
        return {
            ...input,
            name: input.strategyName,
        };
    }
}
