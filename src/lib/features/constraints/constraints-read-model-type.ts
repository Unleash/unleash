import type { IConstraint } from '../../internals.js';

export interface IConstraintsReadModel {
    validateConstraints(constraints: IConstraint[]): Promise<IConstraint[]>;
    validateConstraint(input: IConstraint): Promise<IConstraint>;
}
