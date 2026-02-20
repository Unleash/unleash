import type { IConstraint, IContextFieldStore } from '../../types/index.js';
import { constraintSchema } from '../../schema/feature-schema.js';
import {
    DATE_OPERATORS,
    NUM_OPERATORS,
    REGEX,
    SEMVER_OPERATORS,
    STRING_OPERATORS,
} from '../../util/index.js';
import {
    validateDate,
    validateLegalValues,
    validateNumber,
    validateSemver,
    validateString,
    validateRegex,
} from '../../util/validators/constraint-types.js';
import type { IConstraintsReadModel } from './constraints-read-model-type.js';

const oneOf = (values: string[], match: string) => {
    return values.some((value) => value === match);
};

export class ConstraintsReadModel implements IConstraintsReadModel {
    private contextFieldStore: IContextFieldStore;

    constructor(contextFieldStore: IContextFieldStore) {
        this.contextFieldStore = contextFieldStore;
    }

    async validateConstraints(
        constraints: IConstraint[],
    ): Promise<IConstraint[]> {
        const validations = constraints.map((constraint) => {
            return this.validateConstraint(constraint);
        });

        return Promise.all(validations);
    }

    async validateConstraint(input: IConstraint): Promise<IConstraint> {
        const constraint = await constraintSchema.validateAsync(input);
        const { operator } = constraint;
        if (oneOf(NUM_OPERATORS, operator)) {
            await validateNumber(constraint.value);
        }

        if (oneOf(STRING_OPERATORS, operator)) {
            await validateString(constraint.values);
        }

        if (oneOf(SEMVER_OPERATORS, operator)) {
            // Semver library is not asynchronous, so we do not
            // need to await here.
            validateSemver(constraint.value);
        }

        if (oneOf(DATE_OPERATORS, operator)) {
            await validateDate(constraint.value);
        }

        if (operator === REGEX) {
            validateRegex(constraint.value);
        }

        if (await this.contextFieldStore.exists(constraint.contextName)) {
            const contextDefinition = await this.contextFieldStore.get(
                constraint.contextName,
            );

            if (
                contextDefinition?.legalValues &&
                contextDefinition.legalValues.length > 0
            ) {
                const valuesToValidate = oneOf(
                    [
                        ...DATE_OPERATORS,
                        ...SEMVER_OPERATORS,
                        ...NUM_OPERATORS,
                        REGEX,
                    ],
                    operator,
                )
                    ? constraint.value
                    : constraint.values;
                validateLegalValues(
                    contextDefinition.legalValues,
                    valuesToValidate,
                );
            }
        }

        return constraint;
    }
}
