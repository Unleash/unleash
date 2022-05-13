import { Mapper } from './mapper';
import { IConstraint } from '../../types/model';
import { ConstraintSchema } from '../spec/constraint-schema';

export class ConstraintMapper
    implements Mapper<ConstraintSchema, IConstraint, Partial<ConstraintSchema>>
{
    fromPublic(input: ConstraintSchema): IConstraint {
        return {
            ...input,
        };
    }

    toPublic(input: IConstraint): ConstraintSchema {
        return {
            ...input,
            operator: input.operator,
        };
    }
}
