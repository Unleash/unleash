import { SchemaMapper } from './mapper';
import { IStrategyConfig } from '../../types/model';
import { StrategySchema } from '../spec/strategy-schema';
import { CreateStrategySchema } from '../spec/create-strategy-schema';
import { UpdateStrategySchema } from '../spec/update-strategy-schema';

export class StrategyMapper
    implements
        SchemaMapper<
            StrategySchema,
            IStrategyConfig,
            CreateStrategySchema | UpdateStrategySchema
        >
{
    fromPublic(input: StrategySchema): IStrategyConfig {
        return input;
    }

    toPublic(input: IStrategyConfig): StrategySchema {
        return input;
    }

    mapInput(
        input: CreateStrategySchema | UpdateStrategySchema,
    ): IStrategyConfig {
        return {
            ...input,
            name: input.name || '',
            parameters: input.parameters || {},
            constraints: input.constraints || [],
        };
    }
}
