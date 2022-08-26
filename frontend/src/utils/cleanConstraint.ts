import { singleValueOperators } from 'constants/operators';
import { IConstraint } from 'interfaces/strategy';
import { oneOf } from 'utils/oneOf';
import produce from 'immer';

export const cleanConstraint = (
    constraint: Readonly<IConstraint>
): IConstraint => {
    return produce(constraint, draft => {
        if (oneOf(singleValueOperators, constraint.operator)) {
            delete draft.values;
        } else {
            delete draft.value;
        }
    });
};
