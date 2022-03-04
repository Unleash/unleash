import { IConstraint } from '../../../interfaces/strategy';
import ConditionallyRender from '../ConditionallyRender';

import { ConstraintAccordionEdit } from './ConstraintAccordionEdit/ConstraintAccordionEdit';
import { ConstraintAccordionView } from './ConstraintAccordionView/ConstraintAccordionView';

interface IConstraintAccordionProps {
    compact: boolean;
    editing: boolean;
    environmentId: string;
    constraint: IConstraint;
    onEdit: () => void;
    onCancel: () => void;
    onDelete: () => void;
    onSave: (constraint: IConstraint) => void;
}

export const ConstraintAccordion = ({
    constraint,
    compact = false,
    editing,
    environmentId,
    onEdit,
    onCancel,
    onDelete,
    onSave,
}: IConstraintAccordionProps) => {
    if (!constraint) return null;

    return (
        <ConditionallyRender
            condition={editing}
            show={
                <ConstraintAccordionEdit
                    constraint={constraint}
                    onCancel={onCancel}
                    onSave={onSave}
                    compact={compact}
                />
            }
            elseShow={
                <ConstraintAccordionView
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    environmentId={environmentId}
                    compact={compact}
                />
            }
        />
    );
};
