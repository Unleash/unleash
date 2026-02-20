import type { IConstraint } from '../../types/index.js';
import type { IConstraintsReadModel } from './constraints-read-model-type.js';

export class FakeConstraintsReadModel implements IConstraintsReadModel {
    public async validateConstraints(
        constraints: IConstraint[],
    ): Promise<IConstraint[]> {
        // In the fake read model, we simply return the input constraints without any validation.
        return constraints;
    }

    public async validateConstraint(input: IConstraint): Promise<IConstraint> {
        // In the fake read model, we simply return the input constraint without any validation.
        return input;
    }
}
