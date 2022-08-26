import { IConstraint } from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { ConstraintAccordionEdit } from './ConstraintAccordionEdit/ConstraintAccordionEdit';
import { ConstraintAccordionView } from './ConstraintAccordionView/ConstraintAccordionView';

interface IConstraintAccordionProps {
    compact: boolean;
    editing: boolean;
    constraint: IConstraint;
    onCancel: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onSave?: (constraint: IConstraint) => void;
}

export const ConstraintAccordion = ({
    constraint,
    compact = false,
    editing,
    onEdit,
    onCancel,
    onDelete,
    onSave,
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
