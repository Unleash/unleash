import { singleValueOperators } from 'constants/operators';
import { IConstraint } from 'interfaces/strategy';
import { oneOf } from './one-of';

const VALUES = 'values';
const VALUE = 'value';

export const cleanConstraint = (
    constraint: Readonly<IConstraint>
): IConstraint => {
    const constraintCopy: IConstraint = {
        contextName: '',
        operator: 'IN',
    };

    if (oneOf(singleValueOperators, constraint.operator)) {
        for (const [key, value] of Object.entries(constraint)) {
            if (key !== VALUES) {
                constraintCopy[key] = value;
            }
        }
        return constraintCopy;
    } else {
        for (const [key, value] of Object.entries(constraint)) {
            if (key !== VALUE) {
                constraintCopy[key] = value;
            }
        }
        return constraintCopy;
    }
};
