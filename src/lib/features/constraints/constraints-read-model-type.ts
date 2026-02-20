import type { IConstraint } from '../../types/index.js';

export interface IConstraintsReadModel {
    validateConstraints(constraints: IConstraint[]): Promise<IConstraint[]>;
    validateConstraint(input: IConstraint): Promise<IConstraint>;
}
