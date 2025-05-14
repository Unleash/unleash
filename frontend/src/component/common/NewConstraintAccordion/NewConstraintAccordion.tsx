import type { IConstraint } from 'interfaces/strategy';

import { ConstraintAccordionEdit } from './ConstraintAccordionEdit/ConstraintAccordionEdit.tsx';
import { ConstraintAccordionView } from './ConstraintAccordionView/ConstraintAccordionView.tsx';

export interface IConstraintAccordionProps {
    compact: boolean;
    editing: boolean;
    constraint: IConstraint;
    onCancel: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onAutoSave?: (constraint: IConstraint) => void;
    onSave?: (constraint: IConstraint) => void;
}

export const NewConstraintAccordion = ({
    constraint,
    compact = false,
    editing,
    onEdit,
    onCancel,
    onDelete,
    onSave,
    onAutoSave,
}: IConstraintAccordionProps) => {
    if (!constraint) return null;

    if (editing && onSave) {
        return (
            <ConstraintAccordionEdit
                constraint={constraint}
                onCancel={onCancel}
                onSave={onSave!}
                onDelete={onDelete}
                onAutoSave={onAutoSave!}
                compact={compact}
            />
        );
    }

    return (
        <ConstraintAccordionView
            constraint={constraint}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};
