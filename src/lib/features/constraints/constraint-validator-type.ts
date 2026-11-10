import type { IConstraint } from '../../types/index.js';

export interface IConstraintValidator {
    validateConstraints(constraints: IConstraint[]): Promise<IConstraint[]>;
    validateConstraint(constraint: IConstraint): Promise<IConstraint>;
}
