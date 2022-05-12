import { Mapper } from './mapper';
import { IStrategyConfig } from '../../types/model';
import { StrategySchema } from '../spec/strategy-schema';
import { CreateStrategySchema } from '../spec/create-strategy-schema';

export default class StrategyMapper
    implements Mapper<StrategySchema, IStrategyConfig, CreateStrategySchema>
{
    map(input: StrategySchema): IStrategyConfig {
        return {
            ...input,
        };
    }

    inverseMap(input: IStrategyConfig): StrategySchema {
        return {
            ...input,
        };
    }

    mapInput(input: CreateStrategySchema): IStrategyConfig {
        return {
            ...input,
            name: input.name || '',
            parameters: input.parameters || {},
            constraints: input.constraints || [],
        };
    }
}
