import type { IConstraint } from 'interfaces/strategy';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onDelete: () => void;
    onAutoSave: (constraint: IConstraint) => void;
}

export const EditableConstraintWrapper = (
    props: IConstraintAccordionEditProps,
) => {
    return <EditableConstraint {...props} />;
};
