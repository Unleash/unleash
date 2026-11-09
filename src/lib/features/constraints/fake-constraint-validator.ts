import type { IConstraint } from '../../types/index.js';
import type { IConstraintValidator } from './constraint-validator-type.js';

export class FakeConstraintValidator implements IConstraintValidator {
    public async validateConstraints(
        constraints: IConstraint[],
    ): Promise<IConstraint[]> {
        // In the fake validator, we simply return the input constraints without any validation.
        return constraints;
    }

    public async validateConstraint(
        constraint: IConstraint,
    ): Promise<IConstraint> {
        // In the fake validator, we simply return the constraint constraint without any validation.
        return constraint;
    }
}
