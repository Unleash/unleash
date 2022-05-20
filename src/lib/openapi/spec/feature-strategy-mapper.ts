import { IFeatureStrategy } from '../../types/model';
import { CreateStrategySchema } from './create-strategy-schema';
import { UpdateStrategySchema } from './update-strategy-schema';
import { FeatureStrategySchema } from './feature-strategy-schema';
import { SchemaMapper } from '../types';

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
