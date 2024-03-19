import type { IConstraint } from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { ConstraintAccordionEdit } from './ConstraintAccordionEdit/ConstraintAccordionEdit';
import { ConstraintAccordionView } from './ConstraintAccordionView/ConstraintAccordionView';

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

    return (
        <ConditionallyRender
            condition={Boolean(editing && onSave)}
            show={
                <ConstraintAccordionEdit
                    constraint={constraint}
                    onCancel={onCancel}
                    onSave={onSave!}
                    onDelete={onDelete}
                    onAutoSave={onAutoSave!}
                    compact={compact}
                />
            }
            elseShow={
                <ConstraintAccordionView
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            }
        />
    );
};
