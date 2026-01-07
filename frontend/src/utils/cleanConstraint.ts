import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import { isSingleValueOperator } from 'constants/operators';

export const cleanConstraint = (
    constraint: Readonly<IConstraint>,
): IConstraint => {
    return produce(constraint, (draft) => {
        if (isSingleValueOperator(constraint.operator)) {
            delete draft.values;
        } else {
            delete draft.value;
        }
    });
};
